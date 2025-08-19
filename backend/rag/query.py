import os
import json
import numpy as np
import faiss
from pathlib import Path

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None
try:
    import openai
except ImportError:
    openai = None
try:
    from transformers import pipeline
except ImportError:
    pipeline = None

def load_index(index_dir):
    index = faiss.read_index(str(Path(index_dir) / 'advisory.index'))
    with open(Path(index_dir) / 'advisory_meta.json', encoding='utf-8') as f:
        meta = json.load(f)
    return index, meta

def get_embedder():
    api_key = os.environ.get('OPENAI_API_KEY')
    if api_key and openai:
        def embed_openai(texts):
            openai.api_key = api_key
            resp = openai.Embedding.create(input=texts, model='text-embedding-ada-002')
            return np.array([d['embedding'] for d in resp['data']]).astype('float32')
        return embed_openai, 'openai'
    elif SentenceTransformer:
        model = SentenceTransformer('all-MiniLM-L6-v2')
        def embed_st(texts):
            return model.encode(texts, show_progress_bar=False)
        return embed_st, 'sentence-transformers'
    else:
        raise RuntimeError('No embedding provider available.')

def get_llm():
    api_key = os.environ.get('OPENAI_API_KEY')
    if api_key and openai:
        def llm_openai(prompt):
            openai.api_key = api_key
            resp = openai.ChatCompletion.create(
                model='gpt-3.5-turbo',
                messages=[{"role": "user", "content": prompt}],
                max_tokens=256
            )
            return resp['choices'][0]['message']['content']
        return llm_openai, 'openai'
    elif pipeline:
        pipe = pipeline('text-generation', model='sshleifer/tiny-gpt2')
        def llm_local(prompt):
            return pipe(prompt, max_new_tokens=64)[0]['generated_text']
        return llm_local, 'transformers-local'
    else:
        raise RuntimeError('No LLM provider available.')

def compute_confidence(scores, sources):
    if len(scores) == 0:
        return 'Low'
    high = all(s > 0.7 for s in scores[:2])
    agree = len(set(sources[:2])) == 1 if len(sources) > 1 else True
    if high and agree:
        return 'High'
    elif any(s > 0.5 for s in scores) and len(set(sources)) <= 2:
        return 'Medium'
    return 'Low'

def query_rag(user_query, index_dir, k=3):
    index, meta = load_index(index_dir)
    embed_fn, _ = get_embedder()
    emb = embed_fn([user_query['text']])
    D, I = index.search(emb, k)
    top_snippets = [meta[i] for i in I[0] if i < len(meta)]
    scores = [1 / (1 + float(d)) for d in D[0]]
    sources = [s.get('source', '') for s in top_snippets]
    context = '\n'.join([s['text'] for s in top_snippets])
    llm, _ = get_llm()
    prompt = f"Context: {context}\n\nQuestion: {user_query['text']}\nAnswer in {user_query.get('language','en')}."
    answer = llm(prompt)
    confidence = compute_confidence(scores, sources)
    safety_alternatives = []
    if confidence == 'Low':
        safety_alternatives.append('Consult a local expert or extension officer for confirmation.')
    return {
        'answer': answer.strip(),
        'confidence': confidence,
        'sources': [{'title': s.get('source',''), 'doc_id': i} for i, s in zip(I[0], top_snippets)],
        'safety_alternatives': safety_alternatives
    }

# Unit test for scoring logic
if __name__ == '__main__':
    # Test confidence scoring
    assert compute_confidence([0.8, 0.75], ['a','a']) == 'High'
    assert compute_confidence([0.6, 0.4], ['a','b']) == 'Medium'
    assert compute_confidence([0.3, 0.2], ['a','b']) == 'Low'
    print('Confidence scoring tests passed.')

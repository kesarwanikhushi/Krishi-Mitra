import os
import sys
import argparse
import json
import glob
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

def read_documents(data_dir):
    docs = []
    for path in glob.glob(os.path.join(data_dir, '*.md')):
        with open(path, encoding='utf-8') as f:
            docs.append({'text': f.read(), 'source': os.path.basename(path)})
    for path in glob.glob(os.path.join(data_dir, '*.json')):
        with open(path, encoding='utf-8') as f:
            items = json.load(f)
            if isinstance(items, list):
                for item in items:
                    docs.append({'text': item.get('text', ''), 'source': os.path.basename(path)})
            elif isinstance(items, dict):
                docs.append({'text': items.get('text', ''), 'source': os.path.basename(path)})
    return docs

def get_embedder():
    api_key = os.environ.get('OPENAI_API_KEY')
    if api_key and openai:
        def embed_openai(texts):
            openai.api_key = api_key
            resp = openai.Embedding.create(input=texts, model='text-embedding-ada-002')
            return [d['embedding'] for d in resp['data']]
        return embed_openai, 'openai'
    elif SentenceTransformer:
        model = SentenceTransformer('all-MiniLM-L6-v2')
        def embed_st(texts):
            return model.encode(texts, show_progress_bar=True).tolist()
        return embed_st, 'sentence-transformers'
    else:
        raise RuntimeError('No embedding provider available. Install sentence-transformers or set OPENAI_API_KEY.')

def build_index(docs, embed_fn, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    texts = [d['text'] for d in docs]
    embeddings = embed_fn(texts)
    dim = len(embeddings[0])
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings).astype('float32'))
    faiss.write_index(index, os.path.join(out_dir, 'advisory.index'))
    with open(os.path.join(out_dir, 'advisory_meta.json'), 'w', encoding='utf-8') as f:
        json.dump(docs, f, ensure_ascii=False, indent=2)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', required=True, help='Path to advisories data dir')
    parser.add_argument('--out', required=True, help='Output dir for FAISS index and metadata')
    args = parser.parse_args()
    docs = read_documents(args.data)
    if not docs:
        print('No documents found in', args.data)
        sys.exit(1)
    embed_fn, provider = get_embedder()
    print(f'Using embedding provider: {provider}')
    build_index(docs, embed_fn, args.out)
    print(f'Index and metadata written to {args.out}')

if __name__ == '__main__':
    import numpy as np
    main()

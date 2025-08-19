import os
import json
import faiss
import numpy as np
from typing import List, Dict, Any

# You need to provide your own tokenizer, e.g. from transformers
from transformers import AutoTokenizer

def chunk_text(text: str, tokenizer, max_tokens=512, overlap=50) -> List[str]:
    tokens = tokenizer.encode(text, add_special_tokens=False)
    chunks = []
    i = 0
    while i < len(tokens):
        chunk = tokens[i:i+max_tokens]
        chunk_text = tokenizer.decode(chunk)
        chunks.append(chunk_text)
        if i + max_tokens >= len(tokens):
            break
        i += max_tokens - overlap
    return chunks

def build_faiss_index(docs: List[Dict[str, Any]], embed_fn, tokenizer, out_path: str):
    all_chunks = []
    metas = []
    for doc in docs:
        for chunk in chunk_text(doc['text'], tokenizer):
            all_chunks.append(chunk)
            metas.append({
                'crop': doc.get('crop'),
                'district': doc.get('district'),
                'source': doc.get('source'),
            })
    embeddings = embed_fn(all_chunks)
    dim = len(embeddings[0])
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings).astype('float32'))
    faiss.write_index(index, out_path + '.index')
    with open(out_path + '.meta.json', 'w', encoding='utf-8') as f:
        json.dump({'chunks': all_chunks, 'meta': metas}, f, ensure_ascii=False, indent=2)

class AdvisoryRAG:
    def __init__(self, index_path: str, meta_path: str, embed_fn):
        self.index = faiss.read_index(index_path)
        with open(meta_path, encoding='utf-8') as f:
            meta = json.load(f)
        self.chunks = meta['chunks']
        self.metas = meta['meta']
        self.embed_fn = embed_fn

    def query(self, text: str, k=5):
        emb = np.array(self.embed_fn([text])).astype('float32')
        D, I = self.index.search(emb, k)
        results = []
        for idx, score in zip(I[0], D[0]):
            if idx < 0 or idx >= len(self.chunks):
                continue
            results.append({
                'text': self.chunks[idx],
                'score': float(score),
                'meta': self.metas[idx],
            })
        return results

# Example usage:
# tokenizer = AutoTokenizer.from_pretrained('sentence-transformers/all-MiniLM-L6-v2')
# def embed_fn(texts): ...
# build_faiss_index(docs, embed_fn, tokenizer, 'advisory')
# rag = AdvisoryRAG('advisory.index', 'advisory.meta.json', embed_fn)
# print(rag.query('How to sow wheat?'))

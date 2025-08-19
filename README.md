
# Krishi Mitra

A Progressive Web App (PWA) for farmers, providing offline-first AI-powered agricultural advice, voice chat, crop calendar, mandi prices, and more. Built for reliability, transparency, and inclusivity.

---

## Features

- **Offline-First PWA**: Works fully offline after "Download for Offline". All core features (advice, calendar, prices, etc.) are available without internet.
- **Voice Chat**: Ask questions by voice (STT) or text; get answers read aloud (TTS).
- **Crop Calendar**: View sowing/harvest schedules for your crops and district.
- **Mandi Prices**: Get latest market prices for your selected crops.
- **Confidence Meter**: Every answer shows a confidence badge (High/Medium/Low) and sources. Low-confidence answers show safer alternatives.
- **Multilingual**: English, Hindi, Hinglish (with i18n support).
- **Demo Mode**: Try the app with pre-filled data and sample queries, even offline.
- **Background Sync**: Updates datasets in the background when online.
- **Mobile-First UI**: Fast, accessible, and installable on any device.

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Python 3.11+
- (Optional) OpenAI API key for cloud embeddings

### 1. Clone and Install
```sh
git clone https://github.com/your-org/krishi-mitra.git
cd krishi-mitra

# Frontend
cd frontend
npm install

# Backend
cd ../backend
pip install -r requirements-rag.txt
```

### 2. Build RAG Index (for offline/fast queries)
```sh
# Place your .md or .json files in backend/data/advisories/
python -m rag.index_builder --data backend/data/advisories --out backend/data/index
```

### 3. Run Backend
```sh
cd backend
python app.py  # or: gunicorn app:app
```

### 4. Run Frontend
```sh
cd frontend
npm run dev
```

- Visit [http://localhost:3000](http://localhost:3000)
- Click "Download for Offline" in the app to enable full offline mode

---

## Adding New Datasets

- **No code changes needed!**
- Place new `.md` or `.json` files in `backend/data/advisories/`.
- Run the index builder:
  ```sh
  python -m rag.index_builder --data backend/data/advisories --out backend/data/index
  ```
- The app will use the new data automatically after reload/offline update.

---

## Success Metrics & Measurement

- **Latency**: 95% of queries answered in <5 seconds (measured via browser/network logs or backend logs)
- **User Satisfaction**: ≥85% positive feedback (via in-app thumbs up/down or survey)
- **Grounded Answers**: ≥90% of answers cite at least one trusted source (measured via backend logs or random audits)
- **Offline Reliability**: All core features work offline after "Download for Offline" (test by enabling airplane mode)

---

## Deployment

- **Frontend**: Vercel (see `frontend/vercel.json`)
- **Backend**: Docker/Render (see `backend/Dockerfile`, `backend/render.yaml`)
- **CI/CD**: GitHub Actions (`.github/workflows/frontend.yml`)

---

## Contributing

- PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT License. See [LICENSE](LICENSE).

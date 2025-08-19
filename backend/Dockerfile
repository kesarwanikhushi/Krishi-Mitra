FROM python:3.11-slim

WORKDIR /app
COPY . .

# Install all dependencies from single requirements file
RUN pip install --no-cache-dir -r requirements.txt

ENV PORT=5000
ENV CORS_ORIGINS=http://localhost:3000
ENV RAG_MODEL=sentence-transformers

EXPOSE $PORT

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1

CMD exec gunicorn -b 0.0.0.0:$PORT app:app --timeout 120

# OpenAI API Setup Instructions

## To enable AI-powered responses in Krishi Mitra:

### Option 1: Set Environment Variable (Recommended)
1. Get your OpenAI API key from: https://platform.openai.com/api-keys
2. Set the environment variable in your terminal:

**Windows PowerShell:**
```powershell
$env:OPENAI_API_KEY="your-actual-openai-api-key-here"
```

**Windows Command Prompt:**
```cmd
set OPENAI_API_KEY=your-actual-openai-api-key-here
```

**Linux/Mac:**
```bash
export OPENAI_API_KEY="your-actual-openai-api-key-here"
```

### Option 2: Use .env file (Requires python-dotenv)
1. Install python-dotenv: `pip install python-dotenv`
2. Edit the `.env` file in the backend folder
3. Replace `your-openai-api-key-here` with your actual API key

### Features Enabled with OpenAI API:
- ✅ Real AI-powered agricultural advice
- ✅ Multi-language responses (Hindi, Bengali, Gujarati, Punjabi, Arabic, English)
- ✅ Context-aware responses
- ✅ Agricultural expertise
- ✅ RAG (Retrieval Augmented Generation) if index is available

### Without OpenAI API:
- ⚠️ Sample responses only
- ⚠️ Limited functionality
- ⚠️ No real AI intelligence

### API Usage:
- Model: GPT-3.5-turbo
- Max tokens: 500
- Temperature: 0.7
- Cost: ~$0.002 per 1K tokens

## Restart the backend server after setting the API key!

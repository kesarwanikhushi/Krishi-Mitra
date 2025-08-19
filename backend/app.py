
import os
import json
import csv
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from functools import wraps
from time import time
from collections import defaultdict
from loaders import (
    load_weather_sample, load_advisory_sample, load_market_sample, load_soil_sample
)
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'rag'))
from rag import query as rag_query

# Load environment variables from .env file if python-dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("python-dotenv not installed. Set environment variables manually.")
    pass

def error_response(error, detail, code=400):
    return jsonify({'error': error, 'detail': detail}), code

def calculate_confidence(response_text, question, language='english'):
    """
    Calculate confidence score for Gemini responses based on various factors
    """
    if not response_text or not question:
        return {'score': 30, 'level': 'Low', 'factors': ['Incomplete response']}
    
    confidence_score = 50  # Base confidence
    factors = []
    
    # Length and detail analysis
    response_length = len(response_text.split())
    if response_length > 100:
        confidence_score += 15
        factors.append('Detailed response')
    elif response_length > 50:
        confidence_score += 10
        factors.append('Adequate detail')
    else:
        confidence_score -= 10
        factors.append('Brief response')
    
    # Specificity indicators
    specific_terms = [
        'fertilizer', 'pesticide', 'irrigation', 'seed', 'crop', 'soil', 'weather',
        'harvest', 'planting', 'disease', 'pest', 'nutrients', 'ph', 'nitrogen',
        'phosphorus', 'potassium', 'organic', 'compost', 'manure', 'variety'
    ]
    
    response_lower = response_text.lower()
    specificity_count = sum(1 for term in specific_terms if term in response_lower)
    
    if specificity_count >= 5:
        confidence_score += 20
        factors.append('High agricultural specificity')
    elif specificity_count >= 3:
        confidence_score += 15
        factors.append('Good agricultural specificity')
    elif specificity_count >= 1:
        confidence_score += 5
        factors.append('Basic agricultural terms')
    else:
        confidence_score -= 15
        factors.append('Limited agricultural specificity')
    
    # Structure and formatting
    structure_indicators = ['**', '*', '1.', '2.', '•', '-', ':']
    structure_count = sum(1 for indicator in structure_indicators if indicator in response_text)
    
    if structure_count >= 3:
        confidence_score += 10
        factors.append('Well-structured response')
    elif structure_count >= 1:
        confidence_score += 5
        factors.append('Some structure')
    
    # Question relevance (basic keyword matching)
    question_lower = question.lower()
    question_keywords = [word for word in question_lower.split() if len(word) > 3]
    keyword_matches = sum(1 for keyword in question_keywords if keyword in response_lower)
    
    if len(question_keywords) > 0:
        relevance_ratio = keyword_matches / len(question_keywords)
        if relevance_ratio >= 0.7:
            confidence_score += 15
            factors.append('High relevance to question')
        elif relevance_ratio >= 0.4:
            confidence_score += 10
            factors.append('Good relevance to question')
        elif relevance_ratio >= 0.2:
            confidence_score += 5
            factors.append('Some relevance to question')
        else:
            confidence_score -= 10
            factors.append('Limited relevance to question')
    
    # Safety and cautionary statements
    safety_indicators = [
        'consult', 'expert', 'local', 'test', 'recommend', 'suggest', 'may', 
        'should', 'consider', 'caution', 'careful', 'professional'
    ]
    safety_count = sum(1 for indicator in safety_indicators if indicator in response_lower)
    
    if safety_count >= 3:
        confidence_score += 10
        factors.append('Includes safety considerations')
    elif safety_count >= 1:
        confidence_score += 5
        factors.append('Some safety awareness')
    
    # Language consistency
    if language != 'english':
        # For non-English responses, check if response is actually in the requested language
        # This is a simplified check - in production, you'd use language detection
        english_indicators = ['the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by']
        english_count = sum(1 for word in english_indicators if word in response_lower)
        
        if english_count < 5:  # Likely not in English
            confidence_score += 5
            factors.append('Response in requested language')
        else:
            confidence_score -= 5
            factors.append('Language consistency issue')
    
    # Cap the confidence score
    confidence_score = max(0, min(100, confidence_score))
    
    # Determine confidence level
    if confidence_score >= 80:
        level = 'Very High'
    elif confidence_score >= 70:
        level = 'High'
    elif confidence_score >= 55:
        level = 'Medium'
    elif confidence_score >= 40:
        level = 'Low'
    else:
        level = 'Very Low'
    
    return {
        'score': confidence_score,
        'level': level,
        'factors': factors[:5]  # Limit to top 5 factors
    }

def format_gemini_response(text):
    """
    Format Gemini response text for better readability in chat interface with emojis and proper structure
    """
    if not text:
        return text
    
    import re
    
    # Clean up the text
    formatted = text.strip()
    
    # Add emoji mappings for agricultural topics
    emoji_mappings = {
        r'\b(crops?|farming|agriculture|agricultural)\b': '🌾',
        r'\b(seed|seeds|planting|sowing)\b': '🌱',
        r'\b(harvest|harvesting)\b': '🌽',
        r'\b(fertilizer|fertilizers|nutrients?)\b': '💊',
        r'\b(pesticide|pesticides|insecticide|pest control)\b': '🛡️',
        r'\b(irrigation|water|watering)\b': '💧',
        r'\b(soil|ground|earth)\b': '🌍',
        r'\b(weather|climate|temperature|rain|sunshine)\b': '☀️',
        r'\b(disease|diseases|infection)\b': '🦠',
        r'\b(growth|growing|development)\b': '📈',
        r'\b(organic|natural)\b': '🌿',
        r'\b(market|price|sell|selling)\b': '💰',
        r'\b(equipment|tools?|machinery)\b': '🔧',
        r'\b(advice|tip|tips|recommendation)\b': '💡',
        r'\b(warning|caution|avoid|careful)\b': '⚠️',
        r'\b(important|crucial|essential)\b': '❗',
        r'\b(good|excellent|best|optimal)\b': '✅',
        r'\b(problem|issue|difficulty)\b': '❌'
    }
    
    # Apply emoji mappings (case insensitive)
    for pattern, emoji in emoji_mappings.items():
        # Only add emoji if the word doesn't already have an emoji nearby
        formatted = re.sub(f'(?<!{emoji} )(?<!{emoji}){pattern}(?!.*{emoji})', f'{emoji} \\g<0>', formatted, flags=re.IGNORECASE)
    
    # Convert **bold text** to proper HTML-like formatting for frontend
    formatted = re.sub(r'\*\*(.*?)\*\*', r'**\1**', formatted)
    
    # Clean up standalone asterisks that aren't part of formatting
    formatted = re.sub(r'(?<!\*)\*(?!\*)(?!\s*\*)', '', formatted)
    
    # Add horizontal dividers and section formatting
    # Add divider before major sections
    major_sections = [
        r'(\*\*(?:Key Points?|Main Points?|Important|Summary|In Summary|Conclusion|Recommendations?|Advice|Tips?|Steps?|Process|Method|Procedure).*?\*\*)',
        r'(\*\*(?:What to Do|How to|When to|Where to|Why|Benefits?|Advantages?|Disadvantages?|Pros?|Cons?).*?\*\*)',
        r'(\*\*(?:Materials? Needed|Requirements?|Equipment|Tools? Required|Supplies?).*?\*\*)',
        r'(\*\*(?:Timing|Schedule|Calendar|Season|Month|Week).*?\*\*)',
        r'(\*\*(?:Cost|Price|Budget|Economics?).*?\*\*)',
        r'(\*\*(?:Avoid|Don\'t|Never|Warning|Caution|Risk).*?\*\*)',
        r'(\*\*(?:Sustainable|Organic|Natural|Environmental).*?\*\*)'
    ]
    
    for section_pattern in major_sections:
        formatted = re.sub(section_pattern, r'\n\n---\n\n\1', formatted, flags=re.IGNORECASE)
    
    # Add section headers with emojis
    formatted = re.sub(r'\*\*(Key Points?.*?)\*\*', r'📋 **\1**', formatted, flags=re.IGNORECASE)
    formatted = re.sub(r'\*\*(Summary.*?)\*\*', r'📝 **\1**', formatted, flags=re.IGNORECASE)
    formatted = re.sub(r'\*\*(Recommendations?.*?)\*\*', r'💡 **\1**', formatted, flags=re.IGNORECASE)
    formatted = re.sub(r'\*\*(Steps?.*?)\*\*', r'📋 **\1**', formatted, flags=re.IGNORECASE)
    formatted = re.sub(r'\*\*(Materials?.*?)\*\*', r'🛠️ **\1**', formatted, flags=re.IGNORECASE)
    formatted = re.sub(r'\*\*(Timing.*?)\*\*', r'⏰ **\1**', formatted, flags=re.IGNORECASE)
    formatted = re.sub(r'\*\*(Benefits?.*?)\*\*', r'✅ **\1**', formatted, flags=re.IGNORECASE)
    formatted = re.sub(r'\*\*(Avoid.*?|Warning.*?)\*\*', r'⚠️ **\1**', formatted, flags=re.IGNORECASE)
    
    # Add line breaks before numbered sections
    formatted = re.sub(r'(\*\*\d+\.)', r'\n\n\1', formatted)
    formatted = re.sub(r'(?<!\n)(\d+\.(?!\d))', r'\n• \1', formatted)  # Convert numbered lists to bullet points with emoji
    
    # Enhance bullet points
    formatted = re.sub(r'(\* \*\*)', r'\n\n\1', formatted)
    formatted = re.sub(r'((?<!\n)\* )', r'\n• ', formatted)  # Convert * to bullet emoji
    formatted = re.sub(r'^(\* )', r'• ', formatted, flags=re.MULTILINE)  # Convert line-starting * to bullet emoji
    
    # Add line breaks after colons when they introduce lists or sections
    formatted = re.sub(r'(\*\*.*?:\*\*)', r'\1\n', formatted)
    
    # Ensure proper paragraph breaks after sentences that end sections
    formatted = re.sub(r'(\.) (\*\*[A-Z])', r'\1\n\n\2', formatted)
    
    # Clean up multiple consecutive line breaks
    formatted = re.sub(r'\n{3,}', '\n\n', formatted)
    
    # Add spacing before important sections that start with capital letters
    formatted = re.sub(r'([a-z]\.)(?: )([A-Z][^*])', r'\1\n\n\2', formatted)
    
    # Add conclusion divider if there's a concluding paragraph
    if re.search(r'(in conclusion|finally|to summarize|overall|remember)', formatted, re.IGNORECASE):
        formatted = re.sub(r'(.*?(?:in conclusion|finally|to summarize|overall|remember).*)', r'\n\n---\n\n🎯 \1', formatted, flags=re.IGNORECASE)
    
    return formatted.strip()

def rate_limiter(max_per_minute=30):
    calls = defaultdict(list)
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            ip = request.remote_addr
            now = time()
            calls[ip] = [t for t in calls[ip] if now-t < 60]
            if len(calls[ip]) >= max_per_minute:
                return error_response('rate_limited', 'Too many requests', 429)
            calls[ip].append(now)
            return f(*args, **kwargs)
        return wrapped
    return decorator

app = Flask(__name__)

# Configure CORS for both development and production
cors_origins = [
    "http://localhost:3000", 
    "http://localhost:3001",
    "http://localhost:3002",
    "https://krishi-mitra-frontend-dun.vercel.app",
    "https://*.vercel.app"
]

# Add environment variable for production CORS origins
if os.getenv('CORS_ORIGINS'):
    cors_origins.extend(os.getenv('CORS_ORIGINS').split(','))

CORS(app, origins=cors_origins, supports_credentials=True, 
     allow_headers=['Content-Type', 'Authorization'], 
     methods=['GET', 'POST', 'OPTIONS'])


DATA_DIR = os.path.join(os.path.dirname(__file__), '../data')
DATA = {}
DATA_MTIME = {}
DATA_ETAG = {}

def refresh_data():
    try:
        DATA['weather'], DATA_MTIME['weather'], DATA_ETAG['weather'] = load_weather_sample(DATA_DIR)
    except FileNotFoundError:
        print("Warning: weather.json not found, using empty data")
        DATA['weather'], DATA_MTIME['weather'], DATA_ETAG['weather'] = {}, 0, ""
    
    try:
        DATA['advisories'], DATA_MTIME['advisories'], DATA_ETAG['advisories'] = load_advisory_sample(DATA_DIR)
    except FileNotFoundError:
        print("Warning: advisories.json not found, using empty data")
        DATA['advisories'], DATA_MTIME['advisories'], DATA_ETAG['advisories'] = {}, 0, ""
    
    try:
        DATA['market'], DATA_MTIME['market'], DATA_ETAG['market'] = load_market_sample(DATA_DIR)
    except FileNotFoundError:
        print("Warning: market.json not found, using empty data")
        DATA['market'], DATA_MTIME['market'], DATA_ETAG['market'] = {}, 0, ""
    
    try:
        DATA['soil'], DATA_MTIME['soil'], DATA_ETAG['soil'] = load_soil_sample(DATA_DIR)
    except FileNotFoundError:
        print("Warning: soil.json not found, using empty data")
        DATA['soil'], DATA_MTIME['soil'], DATA_ETAG['soil'] = {}, 0, ""

refresh_data()

@app.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'timestamp': time(),
        'cors_origins': cors_origins,
        'environment': os.getenv('FLASK_ENV', 'development')
    })

@app.route('/test', methods=['GET', 'POST'])
def test():
    return jsonify({
        'message': 'Backend is working!',
        'method': request.method,
        'origin': request.headers.get('Origin'),
        'timestamp': time()
    })


def cache_headers(data_type):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            etag = DATA_ETAG.get(data_type)
            last_modified = DATA_MTIME.get(data_type)
            if_none_match = request.headers.get('If-None-Match')
            if_modified_since = request.headers.get('If-Modified-Since')
            if if_none_match == etag or if_modified_since == last_modified:
                return '', 304
            resp = f(*args, **kwargs)
            if isinstance(resp, (list, dict)):
                resp = make_response(jsonify(resp))
            resp.headers['ETag'] = etag
            resp.headers['Last-Modified'] = last_modified
            return resp
        return wrapped
    return decorator

@app.route('/weather')
@rate_limiter()
@cache_headers('weather')
def weather():
    district = request.args.get('district')
    weather = DATA.get('weather', [])
    if not district:
        return error_response('missing_param', 'district required')
    filtered = [w for w in weather if w.get('district') == district]
    return filtered


@app.route('/market')
@rate_limiter()
@cache_headers('market')
def market():
    crop = request.args.get('crop')
    market = request.args.get('market')
    days = int(request.args.get('days', 7))
    market_data = DATA.get('market', [])
    if not crop or not market:
        return error_response('missing_param', 'crop and market required')
    filtered = [m for m in market_data if m.get('crop') == crop and m.get('market') == market]
    filtered = sorted(filtered, key=lambda x: x.get('date', ''))[-days:]
    return filtered


@app.route('/calendar')
@rate_limiter()
def calendar():
    district = request.args.get('district')
    calendar = DATA.get('calendar.sample.json', [])
    if not district:
        return error_response('missing_param', 'district required')
    filtered = [c for c in calendar if c.get('district') == district]
    return jsonify(filtered)


@app.route('/advisories')
@rate_limiter()
@cache_headers('advisories')
def advisories():
    district = request.args.get('district')
    crop = request.args.get('crop')
    advisories = DATA.get('advisories', [])
    if not district or not crop:
        return error_response('missing_param', 'district and crop required')
    filtered = [a for a in advisories if a.get('district') == district and a.get('crop') == crop]
    return filtered

@app.route('/advice', methods=['POST'])
@rate_limiter()
def advice():
    try:
        data = request.get_json(force=True)
        question = data.get('question') or data.get('text')  # Support both 'question' and 'text'
        language = data.get('language', 'english')  # Get language preference
        preferred_language = data.get('preferredLanguage', 'en-US')  # Get language code
        
        if not question:
            return error_response('missing_param', 'question or text required')
        
        print(f"Question: {question}")
        print(f"Language: {language}")
        print(f"Preferred Language Code: {preferred_language}")
        
        # Check for Gemini API key first, then OpenAI
        gemini_api_key = os.getenv('GEMINI_API_KEY', 'AIzaSyDK2pBB_qgsVNOGJb1JHhVllS0rBiasA34')
        openai_api_key = os.getenv('OPENAI_API_KEY')
        
        print(f"Gemini API Key available: {bool(gemini_api_key)}")
        print(f"OpenAI API Key available: {bool(openai_api_key)}")
        
        if gemini_api_key:
            try:
                print("Attempting to use Gemini API...")
                # Use Google Gemini API
                import google.generativeai as genai
                
                print("Gemini API imported successfully")
                
                # Configure Gemini
                genai.configure(api_key=gemini_api_key)
                model = genai.GenerativeModel('gemini-1.5-flash')  # Updated model name
                
                print("Gemini model configured")
                
                # Language-specific system prompts for Gemini
                system_prompts = {
                    'hindi': f"आप एक कृषि विशेषज्ञ हैं। किसानों को हिंदी में सटीक और व्यावहारिक सलाह दें। कृपया अपना उत्तर इस तरह व्यवस्थित करें:\n- मुख्य बिंदुओं को **बोल्ड** में लिखें\n- सूची और बुलेट पॉइंट का उपयोग करें\n- अलग-अलग सेक्शन बनाएं\n- महत्वपूर्ण सुझावों के लिए इमोजी का उपयोग करें\n- स्पष्ट शीर्षक दें\n\nप्रश्न: {question}",
                    'bengali': f"আপনি একজন কৃষি বিশেষজ্ঞ। কৃষকদের বাংলায় সঠিক এবং ব্যবহারিক পরামর্শ দিন। দয়া করে আপনার উত্তর এভাবে সংগঠিত করুন:\n- মূল পয়েন্টগুলি **বোল্ড** করুন\n- তালিকা এবং বুলেট পয়েন্ট ব্যবহার করুন\n- বিভিন্ন বিভাগ তৈরি করুন\n- গুরুত্বপূর্ণ পরামর্শের জন্য ইমোজি ব্যবহার করুন\n- স্পষ্ট শিরোনাম দিন\n\nপ্রশ্ন: {question}",
                    'gujarati': f"તમે એક કૃષિ નિષ્ણાત છો। ખેડૂતોને ગુજરાતીમાં સચોટ અને વ્યવહારિક સલાહ આપો। કૃપા કરીને તમારા જવાબને આ રીતે ગોઠવો:\n- મુખ્ય મુદ્દાઓને **બોલ્ડ** કરો\n- સૂચિ અને બુલેટ પોઇન્ટનો ઉપયોગ કરો\n- વિવિધ વિભાગો બનાવો\n- મહત્વપૂર્ણ સૂચનાઓ માટે ઇમોજીનો ઉપયોગ કરો\n- સ્પષ્ટ શીર્ષકો આપો\n\nપ્રશ્ન: {question}",
                    'punjabi': f"ਤੁਸੀਂ ਇੱਕ ਖੇਤੀਬਾੜੀ ਮਾਹਰ ਹੋ। ਕਿਸਾਨਾਂ ਨੂੰ ਪੰਜਾਬੀ ਵਿੱਚ ਸਟੀਕ ਅਤੇ ਵਿਹਾਰਕ ਸਲਾਹ ਦਿਓ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਜਵਾਬ ਨੂੰ ਇਸ ਤਰ੍ਹਾਂ ਸੰਗਠਿਤ ਕਰੋ:\n- ਮੁੱਖ ਨੁਕਤਿਆਂ ਨੂੰ **ਬੋਲਡ** ਕਰੋ\n- ਸੂਚੀਆਂ ਅਤੇ ਬੁਲੇਟ ਪੁਆਇੰਟਾਂ ਦੀ ਵਰਤੋਂ ਕਰੋ\n- ਵੱਖ-ਵੱਖ ਭਾਗ ਬਣਾਓ\n- ਮਹੱਤਵਪੂਰਨ ਸੁਝਾਵਾਂ ਲਈ ਇਮੋਜੀ ਦੀ ਵਰਤੋਂ ਕਰੋ\n- ਸਪਸ਼ਟ ਸਿਰਲੇਖ ਦਿਓ\n\nਸਵਾਲ: {question}",
                    'arabic': f"أنت خبير زراعي. قدم نصائح دقيقة وعملية للمزارعين باللغة العربية। يرجى تنظيم إجابتك بهذا الشكل:\n- اجعل النقاط الرئيسية **عريضة**\n- استخدم القوائم والنقاط النقطية\n- أنشئ أقساماً مختلفة\n- استخدم الرموز التعبيرية للنصائح المهمة\n- أعط عناوين واضحة\n\nالسؤال: {question}",
                    'english': f"""You are an agricultural expert. Provide accurate and practical advice to farmers in English. 

Please structure your response with:
- Use **bold** for main headings and important points
- Create clear sections with descriptive headings
- Use bullet points and numbered lists for clarity
- Include relevant emojis for visual appeal and easy reading
- Organize information logically (e.g., **Key Points**, **Steps**, **Materials Needed**, **Tips**, **Things to Avoid**)
- End with a brief **Summary** if the response is long

Make your response visually appealing and easy to scan. Use formatting to help farmers quickly find the information they need.

Question: {question}""",
                    'telugu': f"మీరు వ్యవసాయ నిపుణుడు. రైతులకు తెలుగులో ఖచ్చితమైన మరియు ఆచరణీయమైన సలహలు ఇవ్వండి. దయచేసి మీ సమాధానాన్ని ఈ విధంగా నిర్వహించండి:\n- ముఖ్య అంశాలను **బోల్డ్** లో రాయండి\n- జాబితాలు మరియు బుల్లెట్ పాయింట్లను వాడండి\n- వేర్వేరు విభాగాలను సృష్టించండి\n- ముఖ్యమైన సూచనల కోసం ఇమోజీలను వాడండి\n- స్పష్టమైన శీర్షికలు ఇవ్వండి\n\nప్రశ్న: {question}",
                    'tamil': f"நீங்கள் ஒரு விவசாய நிபுணர். விவசாயிகளுக்கு தமிழில் துல்லியமான மற்றும் நடைமுறை ஆலோசனைகளை வழங்கவும். உங்கள் பதிலை இந்த வகையில் அமைக்கவும்:\n- முக்கிய புள்ளிகளை **தடிமனாக** எழுதவும்\n- பட்டியல்கள் மற்றும் புள்ளி குறிகளைப் பயன்படுத்தவும்\n- வெவ்வேறு பிரிவுகளை உருவாக்கவும்\n- முக்கியமான ஆலோசனைகளுக்கு இமோஜிகளைப் பயன்படுத்தவும்\n- தெளிவான தலைப்புகளைக் கொடுக்கவும்\n\nகேள்வி: {question}",
                    'marathi': f"तुम्ही एक कृषी तज्ञ आहात. शेतकऱ्यांना मराठीत अचूक आणि व्यावहारिक सल्ला द्या. कृपया तुमचे उत्तर या पद्धतीने मांडा:\n- मुख्य मुद्दे **ठळक** अक्षरात लिहा\n- यादी आणि बुलेट पॉइंट्स वापरा\n- वेगवेगळे विभाग तयार करा\n- महत्त्वाच्या सूचनांसाठी इमोजी वापरा\n- स्पष्ट शीर्षके द्या\n\nप्रश्न: {question}",
                    'kannada': f"ನೀವು ಒಬ್ಬ ಕೃಷಿ ತಜ್ಞರು. ರೈತರಿಗೆ ಕನ್ನಡದಲ್ಲಿ ನಿಖರವಾದ ಮತ್ತು ಪ್ರಾಯೋಗಿಕ ಸಲಹೆಯನ್ನು ನೀಡಿ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಈ ರೀತಿಯಲ್ಲಿ ಆಯೋಜಿಸಿ:\n- ಮುಖ್ಯ ವಿಷಯಗಳನ್ನು **ದಪ್ಪವಾಗಿ** ಬರೆಯಿರಿ\n- ಪಟ್ಟಿಗಳು ಮತ್ತು ಬುಲೆಟ್ ಪಾಯಿಂಟ್‌ಗಳನ್ನು ಬಳಸಿ\n- ವಿವಿಧ ವಿಭಾಗಗಳನ್ನು ರಚಿಸಿ\n- ಪ್ರಮುಖ ಸಲಹೆಗಳಿಗಾಗಿ ಇಮೋಜಿಗಳನ್ನು ಬಳಸಿ\n- ಸ್ಪಷ್ಟ ಶೀರ್ಷಿಕೆಗಳನ್ನು ನೀಡಿ\n\nಪ್ರಶ್ನೆ: {question}",
                    'malayalam': f"നിങ്ങൾ ഒരു കൃഷി വിദഗ്ധനാണ്. കർഷകർക്ക് മലയാളത്തിൽ കൃത്യവും പ്രായോഗികവുമായ ഉപദേശം നൽകുക. ദയവായി നിങ്ങളുടെ ഉത്തരം ഈ രീതിയിൽ ക്രമീകരിക്കുക:\n- പ്രധാന പോയിന്റുകൾ **ബോൾഡിൽ** എഴുതുക\n- പട്ടികാകളും ബുള്ളറ്റ് പോയിന്റുകളും ഉപയോഗിക്കുക\n- വ്യത്യസ്ത വിഭാഗങ്ങൾ സൃഷ്ടിക്കുക\n- പ്രധാനപ്പെട്ട നിർദ്ദേശങ്ങൾക്ക് ഇമോജികൾ ഉപയോഗിക്കുക\n- വ്യക്തമായ തലക്കെട്ടുകൾ നൽകുക\n\nചോദ്യം: {question}",
                    'odia': f"ଆପଣ ଜଣେ କୃଷି ବିଶେଷଜ୍ଞ। କୃଷକମାନଙ୍କୁ ଓଡ଼ିଆରେ ସଠିକ ଏବଂ ବ୍ୟବହାରିକ ପରାମର୍ଶ ଦିଅନ୍ତୁ। ଦୟାକରି ଆପଣଙ୍କ ଉତ୍ତରକୁ ଏହି ଉପାୟରେ ସଂଗଠିତ କରନ୍ତୁ:\n- ମୁଖ୍ୟ ବିଷୟଗୁଡ଼ିକୁ **ବୋଲ୍ଡରେ** ଲେଖନ୍ତୁ\n- ତାଲିକା ଏବଂ ବୁଲେଟ ପଏଣ୍ଟ ବ୍ୟବହାର କରନ୍ତୁ\n- ବିଭିନ୍ନ ବିଭାଗ ସୃଷ୍ଟି କରନ୍ତୁ\n- ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ପରାମର୍ଶ ପାଇଁ ଇମୋଜି ବ୍ୟବହାର କରନ୍ତୁ\n- ସ୍ପଷ୍ଟ ଶୀର୍ଷକ ଦିଅନ୍ତୁ\n\nପ୍ରଶ୍ନ: {question}",
                    'assamese': f"আপুনি এজন কৃষি বিশেষজ্ঞ। কৃষকসকলক অসমীয়াত সঠিক আৰু ব্যৱহাৰিক পৰামৰ্শ দিয়ক। দয়া কৰি আপোনাৰ উত্তৰটো এইদৰে সংগঠিত কৰক:\n- মূল কথাবোৰ **ব'ল্ডত** লিখক\n- তালিকা আৰু বুলেট পইণ্ট ব্যৱহাৰ কৰক\n- বেলেগ বেলেগ বিভাগ সৃষ্টি কৰক\n- গুৰুত্বপূৰ্ণ পৰামৰ্শৰ বাবে ইমোজি ব্যৱহাৰ কৰক\n- স্পষ্ট শিৰোনাম দিয়ক\n\nপ্ৰশ্ন: {question}",
                    'urdu': f"آپ ایک زرعی ماہر ہیں۔ کسانوں کو اردو میں درست اور عملی مشورہ دیں۔ براہ کرم اپنا جواب اس طرح منظم کریں:\n- اہم نکات کو **بولڈ** میں لکھیں\n- فہرستیں اور بلٹ پوائنٹس استعمال کریں\n- مختلف سیکشن بنائیں\n- اہم تجاویز کے لیے ایموجی استعمال کریں\n- واضح سرخیاں دیں\n\nسوال: {question}"
                }
                
                prompt = system_prompts.get(language, system_prompts['english'])
                
                print(f"Sending prompt to Gemini: {prompt[:100]}...")
                
                # Generate response using Gemini
                response = model.generate_content(prompt)
                response_text = response.text
                
                print(f"Raw Gemini response: {response_text[:200]}...")
                
                # Format the response for better readability
                formatted_response = format_gemini_response(response_text)
                
                print(f"Formatted response: {formatted_response[:200]}...")
                
                # Calculate confidence score
                confidence_data = calculate_confidence(formatted_response, question, language)
                
                print(f"Confidence calculated: {confidence_data['level']} ({confidence_data['score']}%)")
                
                return jsonify({
                    'advice': formatted_response,
                    'answer': formatted_response,
                    'status': 'success',
                    'language': language,
                    'detectedLanguage': preferred_language,
                    'confidence': confidence_data['level'],
                    'confidenceScore': confidence_data['score'],
                    'confidenceFactors': confidence_data['factors'],
                    'sources': [],
                    'safety_alternatives': ['Please consult with local agricultural experts for region-specific advice.'],
                    'provider': 'gemini-pro'
                })
                
            except Exception as e:
                print(f"Gemini API Error: {e}")
                print(f"Error type: {type(e)}")
                import traceback
                traceback.print_exc()
                # Fall through to OpenAI or sample responses
                pass
        
        if openai_api_key:
            try:
                # Use RAG system with OpenAI
                index_dir = os.path.join(os.path.dirname(__file__), 'rag', 'index')
                
                # Prepare query for RAG system
                user_query = {
                    'text': question,
                    'language': preferred_language
                }
                
                # Check if index exists
                if os.path.exists(index_dir):
                    rag_response = rag_query.query_rag(user_query, index_dir)
                    response_text = rag_response['answer']
                    confidence = rag_response.get('confidence', 'Medium')
                    sources = rag_response.get('sources', [])
                    safety_alternatives = rag_response.get('safety_alternatives', [])
                    
                    return jsonify({
                        'advice': response_text,
                        'answer': response_text,
                        'status': 'success',
                        'language': language,
                        'detectedLanguage': preferred_language,
                        'confidence': confidence,
                        'sources': sources,
                        'safety_alternatives': safety_alternatives,
                        'provider': 'openai-rag'
                    })
                else:
                    # Use direct OpenAI if no RAG index
                    import openai
                    openai.api_key = openai_api_key
                    
                    # Language-specific system prompts
                    system_prompts = {
                        'hindi': "आप एक कृषि विशेषज्ञ हैं। किसानों को हिंदी में सटीक और व्यावहारिक सलाह दें।",
                        'bengali': "আপনি একজন কৃষি বিশেষজ্ঞ। কৃষকদের বাংলায় সঠিক এবং ব্যবহারিক পরামর্শ দিন।",
                        'gujarati': "તમે એક કૃષિ નિષ્ણાત છો। ખેડૂતોને ગુજરાતીમાં સચોટ અને વ્યવહારિક સલાહ આપો।",
                        'punjabi': "ਤੁਸੀਂ ਇੱਕ ਖੇਤੀਬਾੜੀ ਮਾਹਰ ਹੋ। ਕਿਸਾਨਾਂ ਨੂੰ ਪੰਜਾਬੀ ਵਿੱਚ ਸਟੀਕ ਅਤੇ ਵਿਹਾਰਕ ਸਲਾਹ ਦਿਓ।",
                        'telugu': "మీరు వ్యవసాయ నిపుణుడు. రైతులకు తెలుగులో ఖచ్చితమైన మరియు ఆచరణీయమైన సలహలు ఇవ్వండి।",
                        'tamil': "நீங்கள் ஒரு விவசாய நிபுணர். விவசாயிகளுக்கு தமிழில் துல்லியமான மற்றும் நடைமுறை ஆலோசனைகளை வழங்கவும்।",
                        'marathi': "तुम्ही एक कृषी तज्ञ आहात. शेतकऱ्यांना मराठीत अचूक आणि व्यावहारिक सल्ला द्या।",
                        'kannada': "ನೀವು ಒಬ್ಬ ಕೃಷಿ ತಜ್ಞರು. ರೈತರಿಗೆ ಕನ್ನಡದಲ್ಲಿ ನಿಖರವಾದ ಮತ್ತು ಪ್ರಾಯೋಗಿಕ ಸಲಹೆಯನ್ನು ನೀಡಿ।",
                        'malayalam': "നിങ്ങൾ ഒരു കൃഷി വിദഗ്ധനാണ്. കർഷകർക്ക് മലയാളത്തിൽ കൃത്യവും പ്രായോഗികവുമായ ഉപദേശം നൽകുക।",
                        'odia': "ଆପଣ ଜଣେ କୃଷି ବିଶେଷଜ୍ଞ। କୃଷକମାନଙ୍କୁ ଓଡ଼ିଆରେ ସଠିକ ଏବଂ ବ୍ୟବହାରିକ ପରାମର୍ଶ ଦିଅନ୍ତୁ।",
                        'assamese': "আপুনি এজন কৃষি বিশেষজ্ঞ। কৃষকসকলক অসমীয়াত সঠিক আৰু ব্যৱহাৰিক পৰামৰ্শ দিয়ক।",
                        'urdu': "آپ ایک زرعی ماہر ہیں۔ کسانوں کو اردو میں درست اور عملی مشورہ دیں۔",
                        'arabic': "أنت خبير زراعي. قدم نصائح دقيقة وعملية للمزارعين باللغة العربية.",
                        'english': "You are an agricultural expert. Provide accurate and practical advice to farmers in English."
                    }
                    
                    system_prompt = system_prompts.get(language, system_prompts['english'])
                    
                    response = openai.ChatCompletion.create(
                        model='gpt-3.5-turbo',
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": question}
                        ],
                        max_tokens=500,
                        temperature=0.7
                    )
                    
                    response_text = response['choices'][0]['message']['content']
                    
                    return jsonify({
                        'advice': response_text,
                        'answer': response_text,
                        'status': 'success',
                        'language': language,
                        'detectedLanguage': preferred_language,
                        'confidence': 'High',
                        'sources': [],
                        'safety_alternatives': ['Please consult with local agricultural experts for region-specific advice.'],
                        'provider': 'openai-direct'
                    })
                    
            except Exception as e:
                print(f"OpenAI API Error: {e}")
                # Fallback to sample responses if OpenAI fails
                pass
        
        # Fallback to sample responses if no API key or error
        language_responses = {
            'hindi': f"""🌾 **कृषि मित्र AI सहायक**

आपके प्रश्न के लिए धन्यवाद: '{question}'

---

📋 **यह एक नमूना उत्तर है**

• यह कृषि मित्र AI सहायक का एक डेमो रिस्पॉन्स है
• बेहतर और विस्तृत उत्तर के लिए API key आवश्यक है
• वास्तविक AI-powered सलाह के लिए Gemini या OpenAI API key सेट करें

---

💡 **सुझाव**

• स्थानीय कृषि विशेषज्ञों से सलाह लें
• अपने क्षेत्र के अनुकूल तकनीकों का प्रयोग करें""",
            
            'bengali': f"""🌾 **কৃষি মিত্র AI সহায়ক**

আপনার প্রশ্নের জন্য ধন্যবাদ: '{question}'

---

📋 **এটি একটি নমুনা উত্তর**

• এটি কৃষি মিত্র AI সহায়কের একটি ডেমো রেসপন্স
• আরও ভাল এবং বিস্তারিত উত্তরের জন্য API key প্রয়োজন
• প্রকৃত AI-powered পরামর্শের জন্য Gemini বা OpenAI API key সেট করুন

---

💡 **পরামর্শ**

• স্থানীয় কৃষি বিশেষজ্ঞদের পরামর্শ নিন
• আপনার অঞ্চলের উপযুক্ত প্রযুক্তি ব্যবহার করুন""",
            
            'gujarati': f"""🌾 **કૃષિ મિત્ર AI સહાયક**

તમારા પ્રશ્ન માટે આભાર: '{question}'

---

📋 **આ એક નમૂનો જવાબ છે**

• આ કૃષિ મિત્ર AI સહાયકનો એક ડેમો રિસ્પોન્સ છે
• વધુ સારા અને વિગતવાર જવાબ માટે API key જરૂરી છે
• વાસ્તવિક AI-powered સલાહ માટે Gemini અથવા OpenAI API key સેટ કરો

---

💡 **સૂચન**

• સ્થાનિક કૃષિ નિષ્ણાતોની સલાહ લો
• તમારા વિસ્તાર અનુકૂળ તકનીકોનો ઉપયોગ કરો""",
            
            'punjabi': f"""🌾 **ਕ੍ਰਿਸ਼ੀ ਮਿੱਤਰ AI ਸਹਾਇਕ**

ਤੁਹਾਡੇ ਸਵਾਲ ਲਈ ਧੰਨਵਾਦ: '{question}'

---

📋 **ਇਹ ਇੱਕ ਨਮੂਨਾ ਜਵਾਬ ਹੈ**

• ਇਹ ਕ੍ਰਿਸ਼ੀ ਮਿੱਤਰ AI ਸਹਾਇਕ ਦਾ ਇੱਕ ਡੈਮੋ ਰਿਸਪਾਂਸ ਹੈ
• ਬਿਹਤਰ ਅਤੇ ਵਿਸਤ੍ਰਿਤ ਜਵਾਬ ਲਈ API key ਲੋੜੀਂਦੀ ਹੈ
• ਅਸਲ AI-powered ਸਲਾਹ ਲਈ Gemini ਜਾਂ OpenAI API key ਸੈੱਟ ਕਰੋ

---

💡 **ਸੁਝਾਅ**

• ਸਥਾਨਕ ਖੇਤੀਬਾੜੀ ਮਾਹਰਾਂ ਤੋਂ ਸਲਾਹ ਲਓ
• ਆਪਣੇ ਖੇਤਰ ਅਨੁਕੂਲ ਤਕਨੀਕਾਂ ਦੀ ਵਰਤੋਂ ਕਰੋ""",
            
            'arabic': f"""🌾 **مساعد كريشي ميترا الذكي**

شكرا لك على سؤالك: '{question}'

---

📋 **هذا رد نموذجي**

• هذا رد توضيحي من مساعد كريشي ميترا الذكي
• للحصول على إجابات أفضل وأكثر تفصيلاً يتطلب API key
• للحصول على نصائح AI حقيقية، يرجى تعيين مفتاح Gemini أو OpenAI API

---

💡 **نصائح**

• استشر خبراء الزراعة المحليين
• استخدم التقنيات المناسبة لمنطقتك""",
            
            'english': f"""🌾 **Krishi Mitra AI Assistant**

Thank you for your question: '{question}'

---

📋 **This is a Sample Response**

• This is a demo response from the Krishi Mitra AI assistant
• For better and detailed responses, API key setup is required
• For real AI-powered agricultural advice, please set up your Gemini or OpenAI API key

---

💡 **Recommendations**

• Consult with local agricultural experts
• Use region-specific farming techniques
• Test any new methods on a small scale first

---

🔧 **Setup Instructions**

• Get your free Gemini API key from Google AI Studio
• Or set up OpenAI API key for enhanced responses
• Configure the API key in your environment variables""",
            
            'telugu': f"""🌾 **కృషి మిత్ర AI సహాయకుడు**

మీ ప్రశ్నకు ధన్యవాదాలు: '{question}'

---

📋 **ఇది ఒక నమూనా సమాధానం**

• ఇది కృషి మిత్ర AI సహాయకుడి డెమో రెస్పాన్స్
• మెరుగైన మరియు వివరణాత్మక సమాధానాల కోసం API key అవసరం
• నిజమైన AI-powered వ్యవసాయ సలహా కోసం Gemini లేదా OpenAI API key సెట్ చేయండి

---

💡 **సూచనలు**

• స్థానిక వ్యవసాయ నిపుణులను సంప్రదించండి
• మీ ప్రాంతానికి అనుకూలమైన వ్యవసాయ పద్ధతులను వాడండి""",
            
            'tamil': f"""🌾 **கிருஷி மித்ரா AI உதவியாளர்**

உங்கள் கேள்விக்கு நன்றி: '{question}'

---

📋 **இது ஒரு மாதிரி பதில்**

• இது கிருஷி மித்ரா AI உதவியாளரின் டெமோ பதில்
• சிறந்த மற்றும் விளக்கமான பதில்களுக்கு API key தேவை
• உண்மையான AI-powered விவசாய ஆலோசனைக்கு Gemini அல்லது OpenAI API key அமைக்கவும்

---

💡 **பரிந்துரைகள்**

• உள்ளூர் வேளாண் நிபுணர்களைக் கலந்தாலோசிக்கவும்
• உங்கள் பகுதிக்கு ஏற்ற நுட்பங்களைப் பயன்படுத்தவும்""",
            
            'marathi': f"""🌾 **कृषी मित्र AI सहाय्यक**

तुमच्या प्रश्नाबद्दल धन्यवाद: '{question}'

---

📋 **हे एक नमुना उत्तर आहे**

• हा कृषी मित्र AI सहाय्यकाचा डेमो रिस्पॉन्स आहे
• चांगल्या आणि तपशीलवार उत्तरांसाठी API key आवश्यक आहे
• वास्तविक AI-powered शेती सल्ल्यासाठी Gemini किंवा OpenAI API key सेट करा

---

💡 **शिफारशी**

• स्थानिक कृषी तज्ञांचा सल्ला घ्या
• तुमच्या क्षेत्रासाठी योग्य तंत्र वापरा""",
            
            'kannada': f"""🌾 **ಕೃಷಿ ಮಿತ್ರ AI ಸಹಾಯಕ**

ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಧನ್ಯವಾದಗಳು: '{question}'

---

📋 **ಇದು ಒಂದು ಮಾದರಿ ಉತ್ತರ**

• ಇದು ಕೃಷಿ ಮಿತ್ರ AI ಸಹಾಯಕನ ಡೆಮೊ ರೆಸ್ಪಾನ್ಸ್
• ಉತ್ತಮ ಮತ್ತು ವಿವರವಾದ ಉತ್ತರಗಳಿಗೆ API key ಅಗತ್ಯ
• ನಿಜವಾದ AI-powered ಕೃಷಿ ಸಲಹೆಗಾಗಿ Gemini ಅಥವಾ OpenAI API key ಸೆಟ್ ಮಾಡಿ

---

💡 **ಶಿಫಾರಸುಗಳು**

• ಸ್ಥಳೀಯ ಕೃಷಿ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ
• ನಿಮ್ಮ ಪ್ರದೇಶಕ್ಕೆ ಸೂಕ್ತವಾದ ತಂತ್ರಗಳನ್ನು ಬಳಸಿ""",
            
            'malayalam': f"""🌾 **കൃഷി മിത്ര AI സഹായി**

നിങ്ങളുടെ ചോദ്യത്തിന് നന്ദി: '{question}'

---

📋 **ഇതൊരു മാതൃക ഉത്തരമാണ്**

• ഇത് കൃഷി മിത്ര AI സഹായിയുടെ ഡെമോ റെസ്പോൺസാണ്
• മെച്ചപ്പെട്ടതും വിശദവുമായ ഉത്തരങ്ങൾക്ക് API key ആവശ്യമാണ്
• യഥാർത്ഥ AI-powered കൃഷി ഉപദേശത്തിനായി Gemini അല്ലെങ്കിൽ OpenAI API key സെറ്റ് ചെയ്യുക

---

💡 **ശുപാർശകൾ**

• പ്രാദേശിക കൃഷി വിദഗ്ധരുമായി കൂടിയാലോചിക്കുക
• നിങ്ങളുടെ പ്രദേശത്തിന് അനുയോജ്യമായ സാങ്കേതികവിദ്യകൾ ഉപയോഗിക്കുക""",
            
            'odia': f"""🌾 **କୃଷି ମିତ୍ର AI ସହାୟକ**

ଆପଣଙ୍କ ପ୍ରଶ୍ନ ପାଇଁ ଧନ୍ୟବାଦ: '{question}'

---

📋 **ଏହା ଏକ ନମୁନା ଉତ୍ତର**

• ଏହା କୃଷି ମିତ୍ର AI ସହାୟକଙ୍କର ଏକ ଡେମୋ ରେସପନ୍ସ
• ଉତ୍ତମ ଏବଂ ବିସ୍ତୃତ ଉତ୍ତର ପାଇଁ API key ଆବଶ୍ୟକ
• ପ୍ରକୃତ AI-powered କୃଷି ପରାମର୍ଶ ପାଇଁ Gemini କିମ୍ବା OpenAI API key ସେଟ କରନ୍ତୁ

---

💡 **ପରାମର୍ଶ**

• ସ୍ଥାନୀୟ କୃଷି ବିଶେଷଜ୍ଞଙ୍କ ସହିତ ପରାମର୍ଶ କରନ୍ତୁ
• ଆପଣଙ୍କ ଅଞ୍ଚଳ ଅନୁକୂଳ ପ୍ରଯୁକ୍ତି ବ୍ୟବହାର କରନ୍ତୁ""",
            
            'assamese': f"""🌾 **কৃষি মিত্ৰ AI সহায়ক**

আপোনাৰ প্ৰশ্নৰ বাবে ধন্যবাদ: '{question}'

---

📋 **এইটো এটা নমুনা উত্তৰ**

• এইটো কৃষি মিত্ৰ AI সহায়কৰ এটা ডেমো ৰেসপনছ
• উন্নত আৰু বিস্তৃত উত্তৰৰ বাবে API key প্ৰয়োজন
• প্ৰকৃত AI-powered কৃষি পৰামৰ্শৰ বাবে Gemini বা OpenAI API key ছেট কৰক

---

💡 **পৰামৰ্শ**

• স্থানীয় কৃষি বিশেষজ্ঞৰ পৰামৰ্শ লওক
• আপোনাৰ অঞ্চলৰ উপযুক্ত প্ৰযুক্তি ব্যৱহাৰ কৰক""",
            
            'urdu': f"""🌾 **کرشی مترا AI اسسٹنٹ**

آپ کے سوال کے لیے شکریہ: '{question}'

---

📋 **یہ ایک نمونہ جواب ہے**

• یہ کرشی مترا AI اسسٹنٹ کا ایک ڈیمو ریسپانس ہے
• بہتر اور تفصیلی جوابات کے لیے API key درکار ہے
• حقیقی AI-powered زرعی مشورے کے لیے Gemini یا OpenAI API key سیٹ کریں

---

💡 **تجاویز**

• مقامی زرعی ماہرین سے مشورہ لیں
• اپنے علاقے کے موزوں طریقے استعمال کریں"""
        }
        
        response_text = language_responses.get(language, language_responses['english'])
        
        # Apply formatting to sample responses as well
        formatted_response = format_gemini_response(response_text)
        
        return jsonify({
            'advice': formatted_response,
            'answer': formatted_response,
            'status': 'success',
            'language': language,
            'detectedLanguage': preferred_language,
            'confidence': 'Low',
            'sources': [],
            'safety_alternatives': ['Please set up Gemini or OpenAI API key for AI-powered responses.'],
            'provider': 'sample'
        })
        
    except Exception as e:
        print(f"Error in advice endpoint: {e}")
        return error_response('bad_request', str(e), 400)

@app.errorhandler(404)
def not_found(e):
    return error_response('not_found', 'Endpoint does not exist', 404)

@app.errorhandler(500)
def server_error(e):
    return error_response('server_error', str(e), 500)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    host = os.getenv('HOST', '0.0.0.0')
    print("Starting Krishi Mitra Backend Server...")
    print(f"Server will be available at: http://{host}:{port}")
    app.run(host=host, port=port, debug=True, use_reloader=False)

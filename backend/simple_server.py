import sys
import os
sys.path.append(os.path.dirname(__file__))

try:
    print("Attempting to import Flask...")
    from flask import Flask, jsonify, request
    print("✓ Flask imported successfully")
    
    print("Attempting to import Flask-CORS...")
    from flask_cors import CORS
    print("✓ Flask-CORS imported successfully")
    
    print("Creating Flask app...")
    app = Flask(__name__)
    CORS(app, origins=["http://localhost:3000", "http://localhost:3001"], supports_credentials=True)
    print("✓ Flask app created successfully")
    
    @app.route('/health')
    def health():
        return jsonify({'status': 'ok', 'message': 'Backend is running!'})

    @app.route('/advice', methods=['POST'])
    def advice():
        try:
            data = request.get_json(force=True)
            question = data.get('question') or data.get('text', 'No question provided')
            language = data.get('language', 'en')
            district = data.get('district', 'Unknown')
            
            # Simple response for testing
            advice_text = f"Thank you for your question: '{question}'. This is a test response from the AI backend. In a real implementation, this would connect to your RAG system to provide agricultural advice based on your location ({district}) and language preference ({language})."
            
            return jsonify({
                'advice': advice_text,
                'status': 'success',
                'question_received': question,
                'language': language,
                'district': district
            })
        except Exception as e:
            return jsonify({
                'error': 'server_error',
                'detail': str(e)
            }), 500
    
    print("Starting server on port 5001...")
    app.run(host='127.0.0.1', port=5001, debug=False, use_reloader=False)
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Installing required packages...")
    os.system("pip install flask flask-cors")
    print("Please restart the server after installation.")
    
except Exception as e:
    print(f"❌ Error starting server: {e}")
    import traceback
    traceback.print_exc()

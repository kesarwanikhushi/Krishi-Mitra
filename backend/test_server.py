from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"], supports_credentials=True)

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'message': 'Backend is running!'})

@app.route('/advice', methods=['POST'])
def advice():
    try:
        data = request.get_json(force=True)
        text = data.get('text', 'No text provided')
        language = data.get('language', 'en')
        district = data.get('district', 'Unknown')
        
        return jsonify({
            'answer': f'Test response for: "{text}" in {language} from {district}',
            'status': 'success',
            'received_data': data
        })
    except Exception as e:
        return jsonify({
            'error': 'server_error',
            'detail': str(e)
        }), 500

if __name__ == '__main__':
    print("Starting Simple Test Backend...")
    print("Server will be available at: http://localhost:5001")
    app.run(host='127.0.0.1', port=5001, debug=True, use_reloader=False)

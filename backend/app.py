
from flask import Flask, jsonify, request
from services.market_data import MarketDataService
from flask_cors import CORS
from flask_caching import Cache
from supabase import create_client, Client
from dotenv import load_dotenv
import os
from functools import wraps

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app) # Enable CORS for frontend communication

# Cache Configuration
app.config['CACHE_TYPE'] = 'SimpleCache'  # Uses memory, good for single process
app.config['CACHE_DEFAULT_TIMEOUT'] = 300 # 5 minutes default
cache = Cache(app)

# Initialize Supabase Client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY environment variables")

supabase: Client = create_client(url, key)

# Initialize Services
market_data_service = MarketDataService()

# Auth Decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1] # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Token is missing or malformed!'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            # Verify token with Supabase
            user_response = supabase.auth.get_user(token)
            current_user = user_response.user
            
            if not current_user:
                 return jsonify({'message': 'Invalid or expired token!'}), 401
                 
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401

        return f(current_user, *args, **kwargs)

    return decorated

@app.route('/api/market/indices')
@cache.cached(timeout=60) # Cache for 1 minute
def get_indices():
    try:
        data = market_data_service.get_indices()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/market/mood')
@cache.cached(timeout=300) # Cache for 5 minutes (Mood doesn't change instantly)
def get_market_mood():
    try:
        data = market_data_service.get_market_mood()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def home():
    return jsonify({"message": "InvestIQ Backend is running!"})

@app.route('/api/protected', methods=['GET'])
@token_required
def protected_route(current_user):
    return jsonify({
        "message": "You have accessed a protected route!",
        "user_id": current_user.id,
        "email": current_user.email
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)

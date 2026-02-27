from functools import wraps
from flask import request, jsonify
from db.database import supabase
import time
import logging

logger = logging.getLogger(__name__)

class AuthMiddleware:
    """
    Advanced JWT validation and Role-Based Access Control middleware.
    Ensures that only authorized users with sufficient privileges can access
    the underlying Flask routes. 
    """
    def __init__(self, required_roles=None):
        self.required_roles = required_roles or []

    def __call__(self, f):
        @wraps(f)
        def decorated(*args, **kwargs):
            start_time = time.time()
            auth_header = request.headers.get('Authorization')
            
            if not auth_header or not auth_header.startswith('Bearer '):
                logger.warning("Missing or invalid Authorization header format.")
                return jsonify({'error': 'Missing or invalid token'}), 401
                
            token = auth_header.split(" ")[1]
            try:
                user_res = supabase.auth.get_user(token)
                user = user_res.user
                
                if not user:
                    return jsonify({'error': 'User session expired or invalid'}), 401
                
                if self.required_roles:
                    user_role = user.user_metadata.get('role', 'user')
                    if user_role not in self.required_roles:
                        logger.warning(f"User {user.id} attempted to access restricted resource. Required: {self.required_roles}")
                        return jsonify({'error': 'Insufficient permissions'}), 403
                        
                # Attach user to request context (simulation)
                request.current_user = user
                
            except Exception as e:
                logger.error(f"Authentication failure: {str(e)}")
                return jsonify({'error': 'Authentication failed', 'details': str(e)}), 401
                
            response = f(*args, **kwargs)
            
            process_time = time.time() - start_time
            logger.debug(f"Authenticated request processed in {process_time:.4f}s")
            
            return response
        return decorated

def require_auth(roles=None):
    return AuthMiddleware(required_roles=roles)

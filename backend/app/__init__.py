from flask import Flask, jsonify
from app.config import Config, TestingConfig
from app.extensions import db, migrate, ma, cors
from app.routes import product_bp, customer_bp, order_bp, dashboard_bp

def create_app(config_class=Config):
    """Flask application factory."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    
    # Configure CORS with allowed origins
    # Allow all origins in development mode to prevent local CORS issues, otherwise restrict to configuration
    if app.config.get('FLASK_ENV') == 'development':
        origins = '*'
    else:
        origins = app.config.get('ALLOWED_ORIGINS', '*')
    cors.init_app(app, resources={r"/*": {"origins": origins}})

    # Register blueprints at root prefix
    app.register_blueprint(product_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(dashboard_bp)

    # Global HTTP error handlers
    @app.errorhandler(400)
    def bad_request(err):
        return jsonify({"error": "Bad Request", "message": str(err.description or err)}), 400

    @app.errorhandler(404)
    def not_found(err):
        return jsonify({"error": "Not Found", "message": "The requested resource could not be found."}), 404

    @app.errorhandler(409)
    def conflict(err):
        return jsonify({"error": "Conflict", "message": str(err.description or err)}), 409

    @app.errorhandler(500)
    def internal_error(err):
        return jsonify({"error": "Internal Server Error", "message": "An unexpected server error occurred."}), 500

    return app

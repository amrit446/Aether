import os
from app import create_app
from app.extensions import db

app = create_app()

# Auto-initialize database tables in development mode for easier local setups
with app.app_context():
    try:
        db.create_all()
        print("Database tables initialized successfully.")
    except Exception as e:
        print(f"Warning: Could not auto-initialize tables: {e}")

if __name__ == '__main__':
    # Binds to PORT env variable for Render/Docker compatibility
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config.get('FLASK_ENV') == 'development')

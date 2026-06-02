import pytest
from app import create_app
from app.extensions import db
from app.config import TestingConfig

@pytest.fixture
def app():
    """Create and configure a clean Flask application context for each test."""
    app = create_app(TestingConfig)
    
    # Establish application context
    with app.app_context():
        # Build schema tables
        db.create_all()
        yield app
        # Teardown database
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """A test client for executing HTTP requests against the application."""
    return app.test_client()

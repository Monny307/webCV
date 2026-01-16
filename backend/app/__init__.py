from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_mail import Mail
from config import config
import os

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()
mail = Mail()


def create_app(config_name=None):
    """Application factory pattern"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')

    app = Flask(__name__)
    
    # Use chosen config or default
    chosen_config = config.get(config_name, config['development'])
    app.config.from_object(chosen_config)

    # Validate production secrets
    if config_name == 'production':
        if not app.config.get('SECRET_KEY') or app.config.get('SECRET_KEY') == 'dev-secret-key-change-in-production':
             # fallback for safety but warn
             app.logger.warning("SECRET_KEY is not set or is insecure in production!")
        if not app.config.get('JWT_SECRET_KEY') or app.config.get('JWT_SECRET_KEY') == 'jwt-secret-key-change-in-production':
             app.logger.warning("JWT_SECRET_KEY is not set or is insecure in production!")

    # Ensure SQLALCHEMY_DATABASE_URI is set
    if not app.config.get('SQLALCHEMY_DATABASE_URI'):
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)

    # --- FIX: Allow localhost + deployed frontend for CORS ---
    cors_origins = app.config.get('CORS_ORIGINS', ['http://localhost:3000'])
    if isinstance(cors_origins, str):
        cors_origins = [o.strip() for o in cors_origins.split(',')]
    CORS(app,
         resources={r"/api/*": {"origins": cors_origins}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])

    # Upload folder
    upload_folder = app.config.get('UPLOAD_FOLDER', os.path.join(os.getcwd(), 'uploads'))
    os.makedirs(upload_folder, exist_ok=True)
    for sub in ['cvs', 'profiles', 'logos']:
        os.makedirs(os.path.join(upload_folder, sub), exist_ok=True)
    
    # Register blueprints
    from app.routes import auth, users, jobs, applications, profiles, job_alerts, admin, contact, oauth, saved_jobs, cv_analysis, notifications
    
    app.register_blueprint(auth.bp)
    app.register_blueprint(users.bp)
    app.register_blueprint(jobs.bp)
    app.register_blueprint(applications.bp)
    app.register_blueprint(profiles.bp)
    app.register_blueprint(job_alerts.bp)
    app.register_blueprint(admin.bp)
    app.register_blueprint(contact.bp)
    app.register_blueprint(oauth.bp)
    app.register_blueprint(saved_jobs.bp)
    app.register_blueprint(cv_analysis.cv_analysis_bp)
    app.register_blueprint(notifications.notifications_bp)
    
    # Initialize OAuth
    from app.routes.oauth import init_oauth
    init_oauth(app)
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'WebCV Backend API is running'}, 200
    
    @app.route('/')
    def index():
        return {
            'message': 'WebCV Backend API',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/auth/*',
                'users': '/api/users/*',
                'jobs': '/api/jobs/*',
                'applications': '/api/applications/*',
                'profiles': '/api/profiles/*',
                'job_alerts': '/api/job-alerts/*',
                'admin': '/api/admin/*',
                'contact': '/api/contact'
            }
        }, 200
    
    return app

from app import app, db
from app.models import User
from werkzeug.security import generate_password_hash

with app.app_context():
    if not User.query.filter_by(email="admin@demo.com").first():
        admin = User(
            email="admin@demo.com",
            fullname="Admin",
            role="admin",
            password_hash=generate_password_hash("admin123"),
            is_active=True
        )
        db.session.add(admin)
        db.session.commit()
        print("Admin user created")
    else:
        print("Admin already exists")

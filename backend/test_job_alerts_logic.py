import sys
import os
import uuid
from datetime import datetime

# Add the current directory to sys.path to import app
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app import create_app, db
from app.models import User, Job, JobAlert, JobNotification
from app.routes.notifications import check_job_alerts

def test_matching():
    app = create_app()
    with app.app_context():
        # 1. Get or create a test user
        user = User.query.filter_by(email='test_alert@example.com').first()
        if not user:
            user = User(
                email='test_alert@example.com',
                fullname='Test Alert User',
                password_hash='dummy'
            )
            db.session.add(user)
            db.session.commit()
            print(f"Created test user: {user.id}")
        else:
            print(f"Using existing test user: {user.id}")

        # 2. Create a Job Alert for the user
        print("Setting up Job Alert...")
        alert_title = "Python Developer Alert"
        # Clean up old alerts and notifications for this user
        JobNotification.query.filter_by(user_id=user.id).delete()
        JobAlert.query.filter_by(user_id=user.id).delete()
        db.session.commit()
        
        alert = JobAlert(
            user_id=user.id,
            title=alert_title,
            keywords="Python, Backend",
            location="Phnom Penh",
            is_active=True
        )
        db.session.add(alert)
        db.session.commit()
        print(f"Created Job Alert: {alert.id}")

        # 3. Create a matching Job
        job_title = "Senior Python Backend Developer"
        job = Job(
            title=job_title,
            company="Matching Corp",
            location="Phnom Penh",
            category="IT",
            job_type="Full-time",
            description="We are looking for a Python developer with backend experience."
        )
        db.session.add(job)
        db.session.commit()
        print(f"Created matching Job: {job.id}")

        # 4. Trigger the matching engine
        print("Triggering matching engine for Job 1...")
        check_job_alerts(job.id)

        # 5. Verify notification was created
        print("Checking for notification...")
        notif = JobNotification.query.filter_by(
            user_id=user.id,
            job_id=job.id,
            notification_type='job_alert'
        ).first()

        if notif:
            print("[SUCCESS]: Notification created!")
            print(f"Matched Keywords: {notif.matched_keywords}")
        else:
            print("[FAILURE]: Notification not created.")

        # 6. Test non-matching job
        print("\nTesting non-matching job...")
        job2 = Job(
            title="Frontend Developer",
            company="Non Matching Corp",
            location="Siem Reap",
            category="IT",
            job_type="Full-time",
            description="We need a React expert."
        )
        db.session.add(job2)
        db.session.commit()
        check_job_alerts(job2.id)
        
        notif2 = JobNotification.query.filter_by(
            user_id=user.id,
            job_id=job2.id,
            notification_type='job_alert'
        ).first()

        if notif2:
            print("[FAILURE]: Non-matching job triggered a notification.")
        else:
            print("[SUCCESS]: Non-matching job did not trigger a notification.")

        # Cleanup (optional, but good for repeatability)
        db.session.delete(notif) if notif else None
        db.session.delete(job)
        db.session.delete(job2)
        db.session.delete(alert)
        db.session.commit()
        print("\nCleanup completed.")

if __name__ == "__main__":
    test_matching()

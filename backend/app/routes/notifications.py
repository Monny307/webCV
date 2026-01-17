from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Profile, CV, CVKeyword, Job, JobNotification
import re
from uuid import UUID

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('/api/notifications/active-cv', methods=['GET'])
@jwt_required()
def get_active_cv_notifications():
    """Get notifications for jobs matching active CV keywords"""
    try:
        current_user_id = get_jwt_identity()
        # Get user's profile
        profile = Profile.query.filter_by(user_id=current_user_id).first()
        if not profile:
            return jsonify({'notifications': []})
        
        # Get notifications for active CV
        notifications = JobNotification.query.filter_by(
            user_id=current_user_id,
            notification_type='active_cv'
        ).order_by(JobNotification.created_at.desc()).limit(50).all()
        
        # Include job details
        result = []
        for notif in notifications:
            job = Job.query.get(notif.job_id)
            if job:
                notif_dict = notif.to_dict()
                notif_dict['job'] = job.to_dict()
                result.append(notif_dict)
        
        return jsonify({'notifications': result})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notifications_bp.route('/api/notifications/job-alerts', methods=['GET'])
@jwt_required()
def get_job_alert_notifications():
    """Get notifications for jobs matching JobAlert criteria"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get notifications for job alerts
        notifications = JobNotification.query.filter_by(
            user_id=current_user_id,
            notification_type='job_alert'
        ).order_by(JobNotification.created_at.desc()).limit(50).all()
        
        # Include job details
        result = []
        for notif in notifications:
            job = Job.query.get(notif.job_id)
            if job:
                notif_dict = notif.to_dict()
                notif_dict['job'] = job.to_dict()
                # Find the matched alert title if possible
                from app.models import JobAlert
                # In our matching logic we set matched_keywords to [alert.title] if no keywords matched
                # Here we can just send it as is.
                result.append(notif_dict)
        
        return jsonify({'notifications': result})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notifications_bp.route('/api/notifications/all-cvs', methods=['GET'])

@jwt_required()
def get_all_cvs_notifications():
    """Get notifications for jobs matching past/inactive CV keywords"""
    try:
        current_user_id = get_jwt_identity()
        # Get user's profile
        profile = Profile.query.filter_by(user_id=current_user_id).first()
        if not profile:
            return jsonify({'notifications': []})
        
        # Get notifications for past CVs
        notifications = JobNotification.query.filter_by(
            user_id=current_user_id,
            notification_type='past_cv'
        ).order_by(JobNotification.created_at.desc()).limit(50).all()
        
        # Include job and CV details
        result = []
        for notif in notifications:
            job = Job.query.get(notif.job_id)
            cv = CV.query.get(notif.cv_id) if notif.cv_id else None
            if job:
                notif_dict = notif.to_dict()
                notif_dict['job'] = job.to_dict()
                if cv:
                    notif_dict['cv_name'] = cv.name
                result.append(notif_dict)
        
        return jsonify({'notifications': result})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notifications_bp.route('/api/notifications/<notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        current_user_id = get_jwt_identity()
        notification = JobNotification.query.get(notification_id)
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        # Verify ownership
        if str(notification.user_id) != str(current_user_id):
            return jsonify({'error': 'Unauthorized'}), 403
        
        notification.is_read = True
        db.session.commit()
        
        return jsonify({'message': 'Notification marked as read'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@notifications_bp.route('/api/notifications/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Get count of unread notifications"""
    try:
        current_user_id = get_jwt_identity()
        active_cv_count = JobNotification.query.filter_by(
            user_id=current_user_id,
            notification_type='active_cv',
            is_read=False
        ).count()
        
        past_cvs_count = JobNotification.query.filter_by(
            user_id=current_user_id,
            notification_type='past_cv',
            is_read=False
        ).count()
        
        job_alerts_count = JobNotification.query.filter_by(
            user_id=current_user_id,
            notification_type='job_alert',
            is_read=False
        ).count()
        
        total = active_cv_count + past_cvs_count + job_alerts_count
        
        return jsonify({
            'active_cv': active_cv_count,
            'past_cvs': past_cvs_count,
            'job_alerts': job_alerts_count,
            'total': total
        })

    
    except Exception as e:
        return jsonify({'error': str(e)}), 500



def check_job_alerts(job_id):
    """
    Check if a new job matches any user's JobAlert and create notifications.
    """
    try:
        from app.models import JobAlert
        
        # Ensure job_id is a UUID object
        if isinstance(job_id, str):
            job_id = UUID(job_id)
            
        job = Job.query.get(job_id)
        if not job:
            print(f"INFO: Job {job_id} not found in database for alert check")
            return
        
        # Prepare job text for matching
        job_title = job.title.lower()
        job_desc = job.description.lower() if job.description else ''
        job_reqs = job.requirements.lower() if hasattr(job, 'requirements') and job.requirements else ''
        combined_text = f"{job_title} {job_desc} {job_reqs}"
        
        # Get all active job alerts
        alerts = JobAlert.query.filter_by(is_active=True).all()
        print(f"INFO: Checking job alerts for job: '{job.title}' across {len(alerts)} active alerts")
        
        notifications_count = 0
        def is_khmer(text):
            return any('\u1780' <= char <= '\u17FF' for char in text)

        for alert in alerts:
            match = True
            matched_keywords = []
            
            # 1. Match Keywords
            if alert.keywords:
                # Support both comma-separated and space-separated keywords
                keywords = [k.strip() for k in re.split(r'[,;|\s]+', alert.keywords) if k.strip()]
                print(f"DEBUG: Alert keywords: {keywords}")
                keyword_match = False
                for kw in keywords:
                    kw_lower = kw.lower()
                    word_match = re.search(r'\b' + re.escape(kw_lower) + r'\b', combined_text)
                    khmer_match = is_khmer(kw_lower) and kw_lower in combined_text
                    print(f"DEBUG: Checking '{kw_lower}': word_match={bool(word_match)}, khmer_match={khmer_match}")
                    if word_match or khmer_match:
                        matched_keywords.append(kw)
                        keyword_match = True
                
                if not keyword_match:
                    print(f"DEBUG: Keyword match failed for alert '{alert.title}'")
                    match = False
            
            # 2. Match Location
            if match and alert.location:
                print(f"DEBUG: Checking location '{alert.location.lower()}' in '{job.location.lower()}'")
                if alert.location.lower() not in job.location.lower():
                    print(f"DEBUG: Location match failed")
                    match = False
            
            # 3. Match Category
            if match and alert.category:
                if alert.category.lower() not in job.category.lower():
                    match = False
            
            # 4. Match Job Type
            if match and alert.job_type:
                if alert.job_type.lower() not in job.job_type.lower():
                    match = False
            
            # 5. Salary Match (if available)
            if match and (alert.salary_min or alert.salary_max):
                # This is tricky as job.salary is a string like "$500 - $1000" or "Negotiable"
                # For now, we'll skip strict salary matching unless we can parse it reliably
                pass

            if match:
                print(f"DEBUG: Final match for alert '{alert.title}' is True")
                # Check if notification already exists
                existing = JobNotification.query.filter_by(
                    user_id=alert.user_id,
                    job_id=job_id,
                    notification_type='job_alert'
                ).first()
                
                if existing:
                    print(f"DEBUG: Notification already exists for user {alert.user_id}")
                else:
                    print(f"DEBUG: Creating new job_alert notification for user {alert.user_id}")
                    notification = JobNotification(
                        user_id=alert.user_id,
                        job_id=job_id,
                        notification_type='job_alert',
                        matched_keywords=matched_keywords if matched_keywords else [alert.title],
                        is_read=False
                    )
                    db.session.add(notification)
                    alert.last_sent = datetime.utcnow()
                    notifications_count += 1
            else:
                print(f"DEBUG: Final match for alert '{alert.title}' is False")
        
        db.session.commit()
        if notifications_count > 0:
            print(f"[SUCCESS]: Created {notifications_count} job alert notifications for job: '{job.title}'")
            
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR]: Error checking job alerts: {str(e)}")


def check_and_create_notifications(job_id):

    """
    Check if a new job matches any user's CV keywords and create notifications.
    This function should be called after a job is added or scraped.
    """
    def is_khmer(text):
        # Khmer Unicode range: \u1780-\u17FF
        return any('\u1780' <= char <= '\u17FF' for char in text)

    try:
        # Ensure job_id is a UUID object
        if isinstance(job_id, str):
            job_id = UUID(job_id)
            
        job = Job.query.get(job_id)
        if not job:
            print(f"INFO: Job {job_id} not found in database")
            return
        
        # Prepare job text for matching
        job_title = job.title.lower()
        job_desc = job.description.lower() if job.description else ''
        job_reqs = job.requirements.lower() if hasattr(job, 'requirements') and job.requirements else ''
        
        combined_text = f"{job_title} {job_desc} {job_reqs}"
        
        # Get all users with CVs
        profiles = Profile.query.all()
        print(f"INFO: Checking notifications for job: '{job.title}' across {len(profiles)} profiles")
        
        notifications_count = 0
        for profile in profiles:
            # Check active CV keywords
            active_cv = CV.query.filter_by(profile_id=profile.id, is_active=True).first()
            if active_cv:
                cv_keywords = CVKeyword.query.filter_by(cv_id=active_cv.id).first()
                if cv_keywords and cv_keywords.keywords:
                    matched_keywords = []
                    for keyword in cv_keywords.keywords:
                        keyword_lower = keyword.lower()
                        # Use word boundary matching for English, substring for Khmer
                        if re.search(r'\b' + re.escape(keyword_lower) + r'\b', combined_text) or \
                           (is_khmer(keyword_lower) and keyword_lower in combined_text):
                            matched_keywords.append(keyword)
                    
                    if matched_keywords:
                        existing = JobNotification.query.filter_by(
                            user_id=profile.user_id,
                            job_id=job_id,
                            notification_type='active_cv'
                        ).first()
                        
                        if not existing:
                            notification = JobNotification(
                                user_id=profile.user_id,
                                job_id=job_id,
                                cv_id=active_cv.id,
                                notification_type='active_cv',
                                matched_keywords=matched_keywords,
                                is_read=False
                            )
                            db.session.add(notification)
                            notifications_count += 1
            
            # Check past/inactive CV keywords
            inactive_cvs = CV.query.filter_by(profile_id=profile.id, is_active=False).all()
            for cv in inactive_cvs:
                cv_keywords = CVKeyword.query.filter_by(cv_id=cv.id).first()
                if cv_keywords and cv_keywords.keywords:
                    matched_keywords = []
                    for keyword in cv_keywords.keywords:
                        keyword_lower = keyword.lower()
                        if re.search(r'\b' + re.escape(keyword_lower) + r'\b', combined_text) or \
                           (is_khmer(keyword_lower) and keyword_lower in combined_text):
                            matched_keywords.append(keyword)
                    
                    if matched_keywords:
                        existing = JobNotification.query.filter_by(
                            user_id=profile.user_id,
                            job_id=job_id,
                            cv_id=cv.id,
                            notification_type='past_cv'
                        ).first()
                        
                        if not existing:
                            notification = JobNotification(
                                user_id=profile.user_id,
                                job_id=job_id,
                                cv_id=cv.id,
                                notification_type='past_cv',
                                matched_keywords=matched_keywords,
                                is_read=False
                            )
                            db.session.add(notification)
                            notifications_count += 1
        
        db.session.commit()
        print(f"[SUCCESS]: Created {notifications_count} CV notifications for job: '{job.title}'")
        
        # Also check job alerts
        check_job_alerts(job_id)
        
    except Exception as e:

        db.session.rollback()
        print(f"[ERROR]: Error creating notifications: {str(e)}")

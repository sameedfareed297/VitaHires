import os
from flask import current_app
from flask_mail import Message
from app import mail

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def send_email(subject, recipients, body, html_body=None):
    """Send email notification"""
    try:
        msg = Message(
            subject=subject,
            recipients=recipients,
            body=body,
            html=html_body,
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send email: {str(e)}")
        return False

def format_salary(min_salary, max_salary):
    """Format salary range for display"""
    if min_salary and max_salary:
        return f"${min_salary:,} - ${max_salary:,}"
    elif min_salary:
        return f"${min_salary:,}+"
    elif max_salary:
        return f"Up to ${max_salary:,}"
    else:
        return "Salary not specified"

def get_time_ago(date):
    """Get human readable time difference"""
    from datetime import datetime
    
    now = datetime.utcnow()
    diff = now - date
    
    if diff.days > 0:
        return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    else:
        return "Just now"

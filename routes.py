import os
from datetime import datetime
from urllib.parse import urlparse
from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app, send_from_directory
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.utils import secure_filename
from sqlalchemy import or_, and_
from app import db
from models import (User, JobSeekerProfile, EmployerProfile, Job, Application, 
                   SavedJob, Message, BlogPost)
from forms import (LoginForm, JobSeekerRegistrationForm, EmployerRegistrationForm,
                  JobSeekerProfileForm, EmployerProfileForm, JobPostForm, 
                  JobSearchForm, ApplicationForm, ContactForm, MessageForm)
from utils import send_email, allowed_file

# Blueprint definitions
main_bp = Blueprint('main', __name__)
auth_bp = Blueprint('auth', __name__)
jobs_bp = Blueprint('jobs', __name__)
dashboard_bp = Blueprint('dashboard', __name__)
admin_bp = Blueprint('admin', __name__)

# Main routes
@main_bp.route('/')
def index():
    """Homepage with featured jobs and company stats"""
    featured_jobs = Job.query.filter_by(is_active=True, is_approved=True).limit(6).all()
    total_jobs = Job.query.filter_by(is_active=True, is_approved=True).count()
    total_employers = User.query.filter_by(user_type='employer').count()
    total_jobseekers = User.query.filter_by(user_type='jobseeker').count()
    
    return render_template('index.html', 
                         featured_jobs=featured_jobs,
                         total_jobs=total_jobs,
                         total_employers=total_employers,
                         total_jobseekers=total_jobseekers)

@main_bp.route('/about')
def about():
    """About page"""
    return render_template('about.html')

@main_bp.route('/contact', methods=['GET', 'POST'])
def contact():
    """Contact page with form"""
    form = ContactForm()
    if form.validate_on_submit():
        # Send email to admin
        send_email(
            subject=f"Contact Form: {form.subject.data}",
            recipients=[current_app.config.get('MAIL_DEFAULT_SENDER')],
            body=f"From: {form.name.data} ({form.email.data})\n\n{form.message.data}"
        )
        flash('Your message has been sent. We will get back to you soon!', 'success')
        return redirect(url_for('main.contact'))
    
    return render_template('contact.html', form=form)

@main_bp.route('/privacy')
def privacy():
    """Privacy policy page"""
    return render_template('privacy.html')

@main_bp.route('/terms')
def terms():
    """Terms and conditions page"""
    return render_template('terms.html')

@main_bp.route('/blog')
def blog_list():
    """Blog listing page"""
    posts = BlogPost.query.filter_by(is_published=True).order_by(BlogPost.published_at.desc()).all()
    return render_template('blog/list.html', posts=posts)

@main_bp.route('/blog/<slug>')
def blog_detail(slug):
    """Individual blog post"""
    post = BlogPost.query.filter_by(slug=slug, is_published=True).first_or_404()
    return render_template('blog/detail.html', post=post)

# Authentication routes
@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """User login"""
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        
        if user and user.check_password(form.password.data) and user.is_active:
            login_user(user)
            next_page = request.args.get('next')
            if not next_page or urlparse(next_page).netloc != '':
                if user.user_type == 'jobseeker':
                    next_page = url_for('dashboard.jobseeker')
                elif user.user_type == 'employer':
                    next_page = url_for('dashboard.employer')
                elif user.user_type == 'admin':
                    next_page = url_for('admin.dashboard')
                else:
                    next_page = url_for('main.index')
            return redirect(next_page)
        else:
            flash('Invalid email or password', 'danger')
    
    return render_template('auth/login.html', form=form)

@auth_bp.route('/register/jobseeker', methods=['GET', 'POST'])
def register_jobseeker():
    """Job seeker registration"""
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    form = JobSeekerRegistrationForm()
    if form.validate_on_submit():
        # Check if user exists
        if User.query.filter_by(email=form.email.data).first():
            flash('Email already registered', 'danger')
            return render_template('auth/register.html', form=form, user_type='jobseeker')
        
        # Create user
        user = User(email=form.email.data, user_type='jobseeker')
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.flush()  # Get user ID
        
        # Create profile
        profile = JobSeekerProfile(
            user_id=user.id,
            first_name=form.first_name.data,
            last_name=form.last_name.data
        )
        db.session.add(profile)
        db.session.commit()
        
        flash('Registration successful! You can now log in.', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/register.html', form=form, user_type='jobseeker')

@auth_bp.route('/register/employer', methods=['GET', 'POST'])
def register_employer():
    """Employer registration"""
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    form = EmployerRegistrationForm()
    if form.validate_on_submit():
        # Check if user exists
        if User.query.filter_by(email=form.email.data).first():
            flash('Email already registered', 'danger')
            return render_template('auth/register.html', form=form, user_type='employer')
        
        # Create user
        user = User(email=form.email.data, user_type='employer')
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.flush()  # Get user ID
        
        # Create profile
        profile = EmployerProfile(
            user_id=user.id,
            company_name=form.company_name.data,
            contact_person=form.contact_person.data
        )
        db.session.add(profile)
        db.session.commit()
        
        flash('Registration successful! You can now log in.', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/register.html', form=form, user_type='employer')

@auth_bp.route('/logout')
@login_required
def logout():
    """User logout"""
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('main.index'))

# Job routes
@jobs_bp.route('/')
def list_jobs():
    """Job listing with search and filters"""
    form = JobSearchForm()
    query = Job.query.filter_by(is_active=True, is_approved=True)
    
    # Apply filters
    if request.args.get('keywords'):
        keywords = request.args.get('keywords')
        query = query.filter(or_(
            Job.title.contains(keywords),
            Job.description.contains(keywords),
            Job.skills_required.contains(keywords)
        ))
    
    if request.args.get('location'):
        location = request.args.get('location')
        query = query.filter(Job.location.contains(location))
    
    if request.args.get('category'):
        query = query.filter_by(category=request.args.get('category'))
    
    if request.args.get('job_type'):
        query = query.filter_by(job_type=request.args.get('job_type'))
    
    if request.args.get('experience_level'):
        query = query.filter_by(experience_level=request.args.get('experience_level'))
    
    # Pagination
    page = request.args.get('page', 1, type=int)
    jobs = query.order_by(Job.posted_at.desc()).paginate(
        page=page, per_page=12, error_out=False
    )
    
    return render_template('jobs/list.html', jobs=jobs, form=form)

@jobs_bp.route('/<int:job_id>')
def job_detail(job_id):
    """Individual job detail page"""
    job = Job.query.filter_by(id=job_id, is_active=True, is_approved=True).first_or_404()
    
    # Check if user has applied or saved
    has_applied = False
    is_saved = False
    
    if current_user.is_authenticated and current_user.user_type == 'jobseeker':
        has_applied = Application.query.filter_by(
            job_id=job_id, user_id=current_user.id
        ).first() is not None
        
        is_saved = SavedJob.query.filter_by(
            job_id=job_id, user_id=current_user.id
        ).first() is not None
    
    return render_template('jobs/detail.html', job=job, 
                         has_applied=has_applied, is_saved=is_saved)

@jobs_bp.route('/<int:job_id>/apply', methods=['POST'])
@login_required
def apply_job(job_id):
    """Apply for a job"""
    if current_user.user_type != 'jobseeker':
        flash('Only job seekers can apply for jobs', 'danger')
        return redirect(url_for('jobs.job_detail', job_id=job_id))
    
    job = Job.query.filter_by(id=job_id, is_active=True, is_approved=True).first_or_404()
    
    # Check if already applied
    existing_application = Application.query.filter_by(
        job_id=job_id, user_id=current_user.id
    ).first()
    
    if existing_application:
        flash('You have already applied for this job', 'warning')
        return redirect(url_for('jobs.job_detail', job_id=job_id))
    
    # Create application
    application = Application(
        job_id=job_id,
        user_id=current_user.id,
        cover_letter=request.form.get('cover_letter', '')
    )
    db.session.add(application)
    db.session.commit()
    
    # Send notification email to employer
    employer = job.posted_by_user
    if employer.employer_profile:
        send_email(
            subject=f"New Application for {job.title}",
            recipients=[employer.email],
            body=f"A new candidate has applied for your job posting: {job.title}"
        )
    
    flash('Application submitted successfully!', 'success')
    return redirect(url_for('jobs.job_detail', job_id=job_id))

@jobs_bp.route('/<int:job_id>/save', methods=['POST'])
@login_required
def save_job(job_id):
    """Save/unsave a job"""
    if current_user.user_type != 'jobseeker':
        flash('Only job seekers can save jobs', 'danger')
        return redirect(url_for('jobs.job_detail', job_id=job_id))
    
    job = Job.query.filter_by(id=job_id, is_active=True, is_approved=True).first_or_404()
    
    saved_job = SavedJob.query.filter_by(
        job_id=job_id, user_id=current_user.id
    ).first()
    
    if saved_job:
        # Remove from saved
        db.session.delete(saved_job)
        flash('Job removed from saved jobs', 'info')
    else:
        # Add to saved
        saved_job = SavedJob(job_id=job_id, user_id=current_user.id)
        db.session.add(saved_job)
        flash('Job saved successfully!', 'success')
    
    db.session.commit()
    return redirect(url_for('jobs.job_detail', job_id=job_id))

@jobs_bp.route('/post', methods=['GET', 'POST'])
@login_required
def post_job():
    """Post a new job"""
    if current_user.user_type != 'employer':
        flash('Only employers can post jobs', 'danger')
        return redirect(url_for('main.index'))
    
    form = JobPostForm()
    if form.validate_on_submit():
        job = Job(
            title=form.title.data,
            description=form.description.data,
            requirements=form.requirements.data,
            location=form.location.data,
            job_type=form.job_type.data,
            category=form.category.data,
            salary_min=form.salary_min.data,
            salary_max=form.salary_max.data,
            experience_level=form.experience_level.data,
            skills_required=form.skills_required.data,
            expires_at=form.expires_at.data,
            posted_by=current_user.id,
            is_approved=True  # Auto-approve for now
        )
        db.session.add(job)
        db.session.commit()
        
        flash('Job posted successfully!', 'success')
        return redirect(url_for('dashboard.employer'))
    
    return render_template('jobs/post.html', form=form)

# Dashboard routes
@dashboard_bp.route('/jobseeker')
@login_required
def jobseeker():
    """Job seeker dashboard"""
    if current_user.user_type != 'jobseeker':
        flash('Access denied', 'danger')
        return redirect(url_for('main.index'))
    
    # Get user's applications, saved jobs, etc.
    applications = Application.query.filter_by(user_id=current_user.id).order_by(
        Application.applied_at.desc()
    ).all()
    
    saved_jobs = SavedJob.query.filter_by(user_id=current_user.id).order_by(
        SavedJob.saved_at.desc()
    ).all()
    
    messages = Message.query.filter_by(recipient_id=current_user.id).order_by(
        Message.sent_at.desc()
    ).limit(5).all()
    
    return render_template('dashboard/jobseeker.html', 
                         applications=applications, 
                         saved_jobs=saved_jobs,
                         messages=messages)

@dashboard_bp.route('/employer')
@login_required
def employer():
    """Employer dashboard"""
    if current_user.user_type != 'employer':
        flash('Access denied', 'danger')
        return redirect(url_for('main.index'))
    
    # Get employer's posted jobs and applications
    posted_jobs = Job.query.filter_by(posted_by=current_user.id).order_by(
        Job.posted_at.desc()
    ).all()
    
    # Get applications for employer's jobs
    job_ids = [job.id for job in posted_jobs]
    applications = Application.query.filter(
        Application.job_id.in_(job_ids)
    ).order_by(Application.applied_at.desc()).limit(10).all()
    
    messages = Message.query.filter_by(recipient_id=current_user.id).order_by(
        Message.sent_at.desc()
    ).limit(5).all()
    
    return render_template('dashboard/employer.html', 
                         posted_jobs=posted_jobs,
                         applications=applications,
                         messages=messages)

@dashboard_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """User profile editing"""
    if current_user.user_type == 'jobseeker':
        profile = current_user.jobseeker_profile
        form = JobSeekerProfileForm(obj=profile)
        
        if form.validate_on_submit():
            # Handle file upload
            if form.resume.data:
                if allowed_file(form.resume.data.filename):
                    filename = secure_filename(form.resume.data.filename)
                    filename = f"{current_user.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
                    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                    
                    # Create upload directory if it doesn't exist
                    os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
                    
                    form.resume.data.save(filepath)
                    profile.resume_filename = filename
            
            # Update profile
            form.populate_obj(profile)
            db.session.commit()
            flash('Profile updated successfully!', 'success')
            return redirect(url_for('dashboard.profile'))
        
        return render_template('profile/jobseeker_profile.html', form=form, profile=profile)
    
    elif current_user.user_type == 'employer':
        profile = current_user.employer_profile
        form = EmployerProfileForm(obj=profile)
        
        if form.validate_on_submit():
            form.populate_obj(profile)
            db.session.commit()
            flash('Profile updated successfully!', 'success')
            return redirect(url_for('dashboard.profile'))
        
        return render_template('profile/employer_profile.html', form=form, profile=profile)
    
    else:
        flash('Profile not available', 'danger')
        return redirect(url_for('main.index'))

# Admin routes
@admin_bp.route('/dashboard')
@login_required
def dashboard():
    """Admin dashboard"""
    if current_user.user_type != 'admin':
        flash('Access denied', 'danger')
        return redirect(url_for('main.index'))
    
    # Get statistics
    total_users = User.query.count()
    total_jobs = Job.query.count()
    pending_jobs = Job.query.filter_by(is_approved=False).count()
    total_applications = Application.query.count()
    
    # Recent activity
    recent_jobs = Job.query.order_by(Job.posted_at.desc()).limit(10).all()
    recent_users = User.query.order_by(User.created_at.desc()).limit(10).all()
    
    return render_template('dashboard/admin.html',
                         total_users=total_users,
                         total_jobs=total_jobs,
                         pending_jobs=pending_jobs,
                         total_applications=total_applications,
                         recent_jobs=recent_jobs,
                         recent_users=recent_users)

# File upload route
@main_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

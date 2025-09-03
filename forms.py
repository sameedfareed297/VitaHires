from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import StringField, TextAreaField, PasswordField, SelectField, IntegerField, BooleanField, DateField
from wtforms.validators import DataRequired, Email, Length, EqualTo, Optional, NumberRange
from wtforms.widgets import TextArea

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])

class JobSeekerRegistrationForm(FlaskForm):
    first_name = StringField('First Name', validators=[DataRequired(), Length(min=2, max=100)])
    last_name = StringField('Last Name', validators=[DataRequired(), Length(min=2, max=100)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm Password', 
                                   validators=[DataRequired(), EqualTo('password')])

class EmployerRegistrationForm(FlaskForm):
    company_name = StringField('Company Name', validators=[DataRequired(), Length(min=2, max=200)])
    contact_person = StringField('Contact Person', validators=[DataRequired(), Length(min=2, max=100)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm Password', 
                                   validators=[DataRequired(), EqualTo('password')])

class JobSeekerProfileForm(FlaskForm):
    first_name = StringField('First Name', validators=[DataRequired(), Length(min=2, max=100)])
    last_name = StringField('Last Name', validators=[DataRequired(), Length(min=2, max=100)])
    phone = StringField('Phone Number', validators=[Optional(), Length(max=20)])
    location = StringField('Location', validators=[Optional(), Length(max=200)])
    skills = TextAreaField('Skills (comma-separated)')
    experience_years = IntegerField('Years of Experience', validators=[Optional(), NumberRange(min=0, max=50)])
    bio = TextAreaField('Bio')
    linkedin_url = StringField('LinkedIn URL', validators=[Optional(), Length(max=255)])
    portfolio_url = StringField('Portfolio URL', validators=[Optional(), Length(max=255)])
    job_alerts = BooleanField('Receive Job Alerts')
    resume = FileField('Resume', validators=[FileAllowed(['pdf', 'doc', 'docx'], 'PDF and DOC files only!')])

class EmployerProfileForm(FlaskForm):
    company_name = StringField('Company Name', validators=[DataRequired(), Length(min=2, max=200)])
    company_size = SelectField('Company Size', choices=[
        ('', 'Select Size'),
        ('1-10', '1-10 employees'),
        ('11-50', '11-50 employees'),
        ('51-200', '51-200 employees'),
        ('201-500', '201-500 employees'),
        ('500+', '500+ employees')
    ])
    industry = StringField('Industry', validators=[Optional(), Length(max=100)])
    company_description = TextAreaField('Company Description')
    website = StringField('Website', validators=[Optional(), Length(max=255)])
    location = StringField('Location', validators=[Optional(), Length(max=200)])
    contact_person = StringField('Contact Person', validators=[DataRequired(), Length(min=2, max=100)])
    phone = StringField('Phone Number', validators=[Optional(), Length(max=20)])

class JobPostForm(FlaskForm):
    title = StringField('Job Title', validators=[DataRequired(), Length(min=5, max=200)])
    description = TextAreaField('Job Description', validators=[DataRequired()], widget=TextArea())
    requirements = TextAreaField('Requirements')
    location = StringField('Location', validators=[Optional(), Length(max=200)])
    job_type = SelectField('Job Type', choices=[
        ('full-time', 'Full Time'),
        ('part-time', 'Part Time'),
        ('contract', 'Contract'),
        ('remote', 'Remote')
    ], validators=[DataRequired()])
    category = SelectField('Category', choices=[
        ('software-development', 'Software Development'),
        ('data-science', 'Data Science'),
        ('cybersecurity', 'Cybersecurity'),
        ('devops', 'DevOps'),
        ('mobile-development', 'Mobile Development'),
        ('web-development', 'Web Development'),
        ('it-support', 'IT Support'),
        ('project-management', 'Project Management'),
        ('ui-ux-design', 'UI/UX Design'),
        ('other', 'Other')
    ])
    salary_min = IntegerField('Minimum Salary', validators=[Optional(), NumberRange(min=0)])
    salary_max = IntegerField('Maximum Salary', validators=[Optional(), NumberRange(min=0)])
    experience_level = SelectField('Experience Level', choices=[
        ('entry', 'Entry Level'),
        ('mid', 'Mid Level'),
        ('senior', 'Senior Level')
    ])
    skills_required = TextAreaField('Required Skills (comma-separated)')
    expires_at = DateField('Application Deadline', validators=[Optional()])

class JobSearchForm(FlaskForm):
    keywords = StringField('Keywords')
    location = StringField('Location')
    category = SelectField('Category', choices=[
        ('', 'All Categories'),
        ('software-development', 'Software Development'),
        ('data-science', 'Data Science'),
        ('cybersecurity', 'Cybersecurity'),
        ('devops', 'DevOps'),
        ('mobile-development', 'Mobile Development'),
        ('web-development', 'Web Development'),
        ('it-support', 'IT Support'),
        ('project-management', 'Project Management'),
        ('ui-ux-design', 'UI/UX Design'),
        ('other', 'Other')
    ])
    job_type = SelectField('Job Type', choices=[
        ('', 'All Types'),
        ('full-time', 'Full Time'),
        ('part-time', 'Part Time'),
        ('contract', 'Contract'),
        ('remote', 'Remote')
    ])
    experience_level = SelectField('Experience Level', choices=[
        ('', 'All Levels'),
        ('entry', 'Entry Level'),
        ('mid', 'Mid Level'),
        ('senior', 'Senior Level')
    ])

class ApplicationForm(FlaskForm):
    cover_letter = TextAreaField('Cover Letter', validators=[Optional()])

class ContactForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired(), Length(min=2, max=100)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    subject = StringField('Subject', validators=[DataRequired(), Length(min=5, max=200)])
    message = TextAreaField('Message', validators=[DataRequired()])

class MessageForm(FlaskForm):
    subject = StringField('Subject', validators=[DataRequired(), Length(min=5, max=200)])
    content = TextAreaField('Message', validators=[DataRequired()])

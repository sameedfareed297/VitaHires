# Overview

VitaHires is a comprehensive job portal platform built with Flask that connects job seekers with employers. The application serves as a boutique recruiting platform facilitating career opportunities and talent acquisition through user-friendly interfaces for both job seekers and employers.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Template Engine**: Jinja2 templating with Bootstrap 5 for responsive UI components
- **CSS Framework**: Custom CSS variables with Bootstrap integration for consistent theming
- **JavaScript**: Vanilla JavaScript for interactive features including form validation, search functionality, and Bootstrap component initialization
- **Responsive Design**: Mobile-first approach with accessibility features built-in

## Backend Architecture
- **Web Framework**: Flask with Blueprint-based modular routing (main, auth, jobs, dashboard, admin)
- **Database ORM**: SQLAlchemy with declarative base for model definitions
- **Authentication**: Flask-Login for session management with role-based access control (jobseeker, employer, admin)
- **Security**: CSRF protection via Flask-WTF, password hashing with Werkzeug
- **Form Handling**: WTForms for server-side validation and form rendering

## Data Models
- **User Management**: Polymorphic user system with separate profiles for job seekers and employers
- **Job System**: Job postings with applications, categories, and saved jobs functionality
- **Messaging**: Internal messaging system between users
- **Content Management**: Blog posts for career insights and company updates

## File Handling
- **Upload System**: Secure file uploads for resumes and company documents with size and type validation
- **Storage**: Local file system storage with configurable upload directory

## Email System
- **SMTP Integration**: Flask-Mail for transactional emails including notifications and communications
- **Templates**: HTML and text email templates for various user interactions

# External Dependencies

## Core Framework Dependencies
- **Flask**: Web application framework
- **SQLAlchemy**: Database ORM and connection management
- **Flask-Login**: User session and authentication management
- **Flask-Mail**: Email sending capabilities
- **Flask-WTF**: Form handling and CSRF protection

## Frontend Dependencies
- **Bootstrap 5**: CSS framework for responsive design
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Typography (Open Sans font family)

## Database Configuration
- **Primary Database**: PostgreSQL via DATABASE_URL environment variable
- **Fallback**: SQLite for development environments
- **Connection Pooling**: Configured with pool recycling and health checks

## Email Service Integration
- **SMTP Server**: Configurable mail server (defaults to Gmail SMTP)
- **Authentication**: Environment-based credentials for mail services
- **Default Sender**: Configured sender address for all outbound emails

## Environment Configuration
- **Session Management**: Configurable session secrets and lifetime
- **File Upload Limits**: 16MB maximum file size for document uploads
- **Security Headers**: Proxy fix middleware for proper header handling in production
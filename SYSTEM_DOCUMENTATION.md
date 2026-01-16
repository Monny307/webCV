# WebCV - Job Portal & CV Management System
## Complete System Documentation

---

## 1. Executive Summary

**WebCV** is a comprehensive web-based job portal and CV management platform designed to connect job seekers with employers. The system provides intelligent job matching, CV analysis using machine learning, automated job scraping, and a complete application tracking system.

### Key Statistics
- **Architecture**: Full-stack web application
- **Users**: Job seekers and administrators
- **Database**: 9 core tables with relational integrity
- **API Endpoints**: 60+ RESTful endpoints
- **Deployment**: Cloud-hosted (DigitalOcean)
- **Real-time Features**: Job notifications, application tracking

---

## 2. System Architecture

### 2.1 Technology Stack

#### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Deployment**: Local development (Port 3001)

#### Backend
- **Framework**: Flask 3.0 (Python)
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: Bcrypt
- **API Server**: Gunicorn (production)
- **CORS**: Flask-CORS
- **Migrations**: Alembic (Flask-Migrate)

#### Database
- **System**: PostgreSQL (DigitalOcean Managed Database)
- **Connection**: psycopg3
- **ORM**: SQLAlchemy with UUID primary keys
- **Backup**: Automated daily backups

#### External Services
- **ML API**: Job recommendation & CV analysis (http://138.197.13.244:8000)
- **OAuth**: Google Authentication
- **Email**: SMTP (Gmail) for notifications
- **File Storage**: Local uploads (future: AWS S3)

#### DevOps & Deployment
- **Backend Hosting**: DigitalOcean App Platform
- **Database**: DigitalOcean Managed PostgreSQL
- **Version Control**: Git
- **Environment**: Python virtual environment (.venv)

### 2.2 System Architecture Diagram

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  Next.js        │◄───────►│  Flask API       │◄───────►│  PostgreSQL     │
│  Frontend       │  HTTP   │  Backend         │  ORM    │  Database       │
│  (Port 3001)    │  REST   │  (DigitalOcean)  │         │  (DigitalOcean) │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
            │   ML API     │ │   OAuth     │ │   Email      │
            │   (CV AI)    │ │   (Google)  │ │   (SMTP)     │
            └──────────────┘ └─────────────┘ └──────────────┘
```

---

## 3. Core Features

### 3.1 User Management
- ✅ User registration with email verification
- ✅ Secure login with JWT authentication
- ✅ Role-based access control (User/Admin)
- ✅ Password reset via email
- ✅ Google OAuth integration
- ✅ Profile management with photo upload

### 3.2 Job Management
- ✅ Browse and search jobs (215+ active listings)
- ✅ Advanced filtering (location, category, salary, type)
- ✅ Job details with company information
- ✅ Automated job scraping (BongThom integration)
- ✅ Job deadline tracking
- ✅ Save favorite jobs

### 3.3 CV Management
- ✅ Upload multiple CVs (PDF, DOC, DOCX)
- ✅ AI-powered CV text extraction
- ✅ CV builder with manual editing
- ✅ Set active CV for applications
- ✅ Download CV functionality
- ✅ CV keyword matching for job recommendations

### 3.4 Application Tracking
- ✅ One-click job applications
- ✅ Application status tracking (Pending, Reviewed, Accepted, Rejected)
- ✅ Application history
- ✅ Duplicate application prevention
- ✅ Admin application management

### 3.5 Job Notifications
- ✅ Personalized job alerts based on CV keywords
- ✅ Real-time notifications for new matching jobs
- ✅ Email notifications (configurable)
- ✅ In-app notification system

### 3.6 Admin Dashboard
- ✅ System statistics (users, jobs, applications)
- ✅ User management (activate/deactivate)
- ✅ Job CRUD operations
- ✅ Application review and status updates
- ✅ Company logo management

### 3.7 Job Scraping System
- ✅ Automated job scraping from BongThom
- ✅ Duplicate detection
- ✅ Deadline normalization
- ✅ Scheduled execution (APScheduler)
- ✅ Database import with notification creation

---

## 4. Database Schema

### 4.1 Core Tables

#### Users Table
```sql
- id (UUID, PK)
- email (String, Unique, Indexed)
- password_hash (String)
- fullname (String)
- role (String: 'user' | 'admin')
- is_active (Boolean)
- reset_token (String, Nullable)
- reset_token_expiry (DateTime, Nullable)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Profiles Table
```sql
- id (UUID, PK)
- user_id (UUID, FK → users.id, Unique)
- email (String, Nullable)
- phone (String)
- gender (String)
- date_of_birth (Date)
- location (String)
- professional_summary (Text)
- profile_photo (String)
- created_at (DateTime)
- updated_at (DateTime)
```

#### CVs Table
```sql
- id (UUID, PK)
- profile_id (UUID, FK → profiles.id)
- name (String)
- file_path (String)
- status (String: 'completed' | 'needs-editing')
- is_active (Boolean)
- upload_date (DateTime)
- extracted_fullname (String)
- extracted_email (String)
- extracted_phone (String)
- extracted_location (Text)
- extracted_summary (Text)
- extracted_data (JSON)
- cv_builder_data (JSON)
```

#### Jobs Table
```sql
- id (UUID, PK)
- title (String)
- company (String)
- location (String)
- salary (String)
- job_type (String: 'Full-time' | 'Part-time' | 'Contract' | 'Internship')
- category (String)
- description (Text)
- requirements (Text)
- logo (String)
- contact_email (String)
- contact_phone (String)
- website (String)
- status (String: 'active' | 'closed')
- deadline (Date)
- posted_date (DateTime)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Applications Table
```sql
- id (UUID, PK)
- user_id (UUID, FK → users.id)
- job_id (UUID, FK → jobs.id)
- cv_id (UUID, FK → cvs.id)
- cover_letter (Text)
- status (String: 'pending' | 'reviewed' | 'accepted' | 'rejected')
- applied_date (DateTime)
- notes (Text)
```

#### Job Alerts Table
```sql
- id (UUID, PK)
- user_id (UUID, FK → users.id)
- keywords (Text)
- location (String)
- job_type (String)
- frequency (String: 'daily' | 'weekly' | 'instant')
- is_active (Boolean)
- created_at (DateTime)
```

#### Job Notifications Table
```sql
- id (UUID, PK)
- user_id (UUID, FK → users.id)
- job_id (UUID, FK → jobs.id)
- notification_type (String: 'new_match' | 'deadline_soon' | 'status_update')
- message (Text)
- is_read (Boolean)
- created_at (DateTime)
```

#### Saved Jobs Table
```sql
- id (UUID, PK)
- user_id (UUID, FK → users.id)
- job_id (UUID, FK → jobs.id)
- saved_at (DateTime)
```

#### CV Keywords Table
```sql
- id (UUID, PK)
- cv_id (UUID, FK → cvs.id)
- keyword (String)
- category (String)
```

### 4.2 Relationships
```
Users (1) ──→ (1) Profiles
       │
       ├──→ (N) Applications
       │
       ├──→ (N) Job Alerts
       │
       ├──→ (N) Job Notifications
       │
       └──→ (N) Saved Jobs

Profiles (1) ──→ (N) CVs

CVs (1) ──→ (N) CV Keywords
    │
    └──→ (N) Applications

Jobs (1) ──→ (N) Applications
     │
     ├──→ (N) Job Notifications
     │
     └──→ (N) Saved Jobs
```

---

## 5. API Endpoints

### 5.1 Authentication (`/api/auth`)
```
POST   /signup              - User registration
POST   /login               - User login (returns JWT)
POST   /refresh             - Refresh JWT token
GET    /me                  - Get current user info
POST   /change-password     - Change password
POST   /forgot-password     - Request password reset
POST   /reset-password      - Reset password with token
POST   /verify-reset-token  - Verify reset token validity
DELETE /delete-account      - Delete user account
```

### 5.2 Jobs (`/api/jobs`)
```
GET    /                    - List all jobs (with filters)
GET    /:id                 - Get job details
POST   /search              - Advanced job search
```

### 5.3 Applications (`/api/applications`)
```
GET    /                    - List user applications
POST   /                    - Submit application
GET    /:id                 - Get application details
PUT    /:id                 - Update application
DELETE /:id                 - Delete application
GET    /check/:job_id       - Check if already applied
POST   /manual              - Manual application entry
```

### 5.4 Profiles (`/api/profiles`)
```
GET    /                    - Get user profile
POST   /                    - Create profile
PUT    /                    - Update profile
POST   /upload-photo        - Upload profile photo
```

### 5.5 CV Management (`/api/profiles/cvs`)
```
GET    /                    - List user CVs
POST   /upload              - Upload new CV
GET    /:cv_id              - Get CV details
PUT    /:cv_id              - Update CV
DELETE /:cv_id              - Delete CV
POST   /:cv_id/set-active   - Set active CV
```

### 5.6 Job Alerts (`/api/job-alerts`)
```
GET    /                    - List user alerts
POST   /                    - Create alert
GET    /:id                 - Get alert details
PUT    /:id                 - Update alert
DELETE /:id                 - Delete alert
POST   /:id/toggle          - Toggle alert active status
```

### 5.7 Saved Jobs (`/api/saved-jobs`)
```
GET    /                    - List saved jobs
POST   /                    - Save a job
DELETE /:job_id             - Unsave a job
GET    /check/:job_id       - Check if job is saved
```

### 5.8 Notifications (`/api/notifications`)
```
GET    /                    - List user notifications
PUT    /:id/read            - Mark notification as read
PUT    /mark-all-read       - Mark all as read
DELETE /:id                 - Delete notification
```

### 5.9 Admin (`/api/admin`)
```
GET    /stats               - System statistics
GET    /users               - List all users
POST   /users/:id/toggle-status - Activate/deactivate user
GET    /applications        - List all applications
PUT    /applications/:id/status - Update application status
GET    /jobs/:id/applications - List applications for a job
GET    /jobs                - List all jobs (admin view)
POST   /jobs                - Create new job
GET    /jobs/:id            - Get job details
PUT    /jobs/:id            - Update job
DELETE /jobs/:id            - Delete job
POST   /jobs/:id/toggle-status - Toggle job active status
POST   /upload-logo         - Upload company logo
```

### 5.10 OAuth (`/api/auth/oauth`)
```
POST   /google              - Google OAuth login
GET    /callback            - OAuth callback handler
```

### 5.11 Contact (`/api/contact`)
```
POST   /                    - Submit contact form
```

### 5.12 CV Analysis (`/api/analyze-cv`)
```
POST   /                    - Analyze CV with ML API
```

---

## 6. Security Features

### 6.1 Authentication & Authorization
- **JWT Tokens**: Secure stateless authentication
- **Token Expiration**: Access tokens expire after 15 minutes
- **Refresh Tokens**: Extended sessions with refresh mechanism
- **Password Hashing**: Bcrypt with salt rounds
- **Role-Based Access**: User vs Admin permissions

### 6.2 Data Protection
- **SQL Injection Prevention**: SQLAlchemy ORM parameterized queries
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Restricted origins
- **File Upload Validation**: Type and size restrictions
- **UUID Primary Keys**: Non-sequential IDs for security

### 6.3 Password Security
- **Minimum Length**: 6 characters
- **Hashing Algorithm**: Bcrypt
- **Password Reset**: Token-based with expiration
- **Account Recovery**: Email verification

---

## 7. Machine Learning Integration

### 7.1 CV Analysis API
**Endpoint**: `http://138.197.13.244:8000/upload`

**Features**:
- Text extraction from PDFs
- Automatic field recognition (name, email, phone, location)
- Experience parsing
- Education extraction
- Skills identification
- Language detection
- Certification recognition

**Integration Points**:
1. CV upload → ML API analysis
2. Store extracted data in `extracted_data` JSON field
3. Pre-fill CV builder with extracted information
4. Generate keywords for job matching

### 7.2 Job Matching Algorithm
- CV keywords extracted from uploaded CVs
- Job descriptions analyzed for matching terms
- Notification created when match threshold exceeded
- Weighted matching based on keyword frequency

---

## 8. Job Scraping System

### 8.1 Scraper Components
**File**: `backend/app/auto_scraper.py`

**Features**:
- **Source**: BongThom job portal
- **Technology**: Selenium WebDriver + BeautifulSoup
- **Scheduling**: APScheduler (daily execution)
- **Duplicate Detection**: Company + title matching
- **Data Extraction**:
  - Job title
  - Company name
  - Location
  - Salary
  - Job type
  - Category
  - Description
  - Requirements
  - Deadline (with normalization)
  - Posted date

### 8.2 Deadline Parsing
**Intelligent Date Extraction**:
- Recognizes various date formats (DD-MM-YYYY, DD/MM/YYYY)
- Parses relative dates ("until 15 January", "before December 31")
- Normalizes Khmer months to English
- Handles multi-language deadline text

### 8.3 Notification Generation
- Creates notifications for users with matching CV keywords
- Runs after each job import
- Checks all active CVs against new job descriptions

---

## 9. Deployment Configuration

### 9.1 Production Environment

**Backend URL**: `https://king-prawn-app-j2i4c.ondigitalocean.app`

**Database**: 
```
Host: db-postgresql-sgp1-08298-do-user-31421832-0.m.db.ondigitalocean.com
Port: 25060
Database: defaultdb
SSL: Required
```

**Environment Variables**:
```env
DATABASE_URL=postgresql://...
SECRET_KEY=ee100a842a5661102cdb1232c2bbc11555ee9f4fb901f34110b7a8323557f8c6
JWT_SECRET_KEY=4ddc57173bd786e8a5d40dc682221b65d2960738dfbebd3d6af17a62d05ef810
FRONTEND_URL=http://localhost:3000
ML_API_URL=http://138.197.13.244:8000/upload
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
PYTHON_VERSION=3.11.7
```

### 9.2 Application Configuration

**Gunicorn**: 
```bash
gunicorn -w 1 -b 0.0.0.0:$PORT run:app
```

**Database Migrations**:
```bash
flask db upgrade
python seed.py
```

---

## 10. Testing & Quality Assurance

### 10.1 Test Accounts
```
Admin:
  Email: admin@demo.com
  Password: admin123

User:
  Email: user@demo.com
  Password: user123
```

### 10.2 Test Data
- **Users**: 2 (1 admin, 1 regular user)
- **Jobs**: 215+ (5 seeded + 210+ scraped)
- **Categories**: Technology, Marketing, Design, Data Science, Writing
- **Locations**: Phnom Penh, Siem Reap, Remote

---

## 11. Performance Metrics

### 11.1 Response Times
- Authentication: < 200ms
- Job listing: < 500ms
- CV upload: < 2s (with ML processing)
- Job scraping: ~30s per page

### 11.2 Database Performance
- Indexed fields: email, user_id, job_id
- UUID primary keys for distributed systems
- Relationship eager loading for optimized queries

---

## 12. Future Enhancements

### 12.1 Planned Features
- [ ] AWS S3 integration for file storage
- [ ] Real-time chat between employers and job seekers
- [ ] Video interview scheduling
- [ ] Advanced analytics dashboard
- [ ] Mobile application (React Native)
- [ ] Email notification system improvements
- [ ] Multi-language support (Khmer/English)
- [ ] Resume scoring system
- [ ] Company profiles and employer dashboard

### 12.2 Scalability Considerations
- [ ] Redis caching layer
- [ ] CDN for static assets
- [ ] Database read replicas
- [ ] Microservices architecture
- [ ] Kubernetes orchestration
- [ ] Load balancing

---

## 13. Conclusion

WebCV is a robust, production-ready job portal system that combines modern web technologies with machine learning capabilities. The system provides a seamless experience for both job seekers and administrators, with strong security, scalability, and maintainability features.

**Key Achievements**:
- ✅ Full-stack implementation with modern frameworks
- ✅ AI-powered CV analysis
- ✅ Automated job scraping and matching
- ✅ Cloud deployment with managed database
- ✅ RESTful API architecture
- ✅ Comprehensive user and admin features
- ✅ Security-first approach with JWT authentication

**Technical Excellence**:
- Clean code architecture
- Proper error handling
- Database migrations
- API documentation
- Environment-based configuration
- Production-ready deployment

---

## Appendix A: Project Statistics

```
Total Lines of Code: ~15,000+
Backend Files: 25+
Frontend Components: 30+
Database Tables: 9
API Endpoints: 60+
Dependencies:
  - Python packages: 26
  - npm packages: 12
Development Time: 3+ months
```

## Appendix B: Contact & Resources

- **Repository**: Private (Git-based version control)
- **Documentation**: Comprehensive inline comments
- **API Reference**: `/backend/API_REFERENCE.md`
- **Setup Guide**: `/backend/SETUP.md`
- **Quick Start**: `/QUICK_START.md`

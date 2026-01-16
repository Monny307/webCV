# WebCV Frontend - Complete Documentation
## Next.js Application Architecture & Features

---

## 1. Frontend Overview

### 1.1 Technology Stack

**Core Framework**
- **Next.js 14.0.4**: React framework with server-side rendering
- **React 18.2.0**: UI library with hooks
- **TypeScript 5.3.3**: Type-safe JavaScript

**Development Tools**
- **ESLint**: Code linting
- **CSS Modules**: Scoped styling
- **Axios**: HTTP client (implicitly used via fetch)

**Key Dependencies**
```json
{
  "next": "^14.0.4",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "form-data": "^4.0.5",
  "formidable": "^3.5.4",
  "node-fetch": "^2.7.0"
}
```

---

## 2. Project Structure

```
src/
├── components/          # Reusable React components
│   ├── AdminLayout.tsx      # Admin dashboard layout wrapper
│   ├── ErrorBoundary.tsx    # Error catching boundary
│   ├── Footer.tsx           # Site footer
│   ├── Layout.tsx           # Main page layout wrapper
│   ├── LoadingOverlay.tsx   # Loading spinner overlay
│   └── Navbar.tsx           # Navigation bar
│
├── pages/               # Next.js pages (routes)
│   ├── _app.tsx            # Custom App component
│   ├── _document.tsx       # Custom Document component
│   ├── index.tsx           # Homepage (/)
│   ├── login.tsx           # Login page (/login)
│   ├── signup.tsx          # Registration (/signup)
│   ├── profile.tsx         # User profile (/profile)
│   ├── cv-builder.tsx      # CV management (/cv-builder)
│   ├── job-alerts.tsx      # Job alerts (/job-alerts)
│   ├── notifications.tsx   # Notifications (/notifications)
│   ├── settings.tsx        # User settings (/settings)
│   ├── contact-us.tsx      # Contact form (/contact-us)
│   ├── faq.tsx            # FAQ page (/faq)
│   ├── how-it-works.tsx   # Info page (/how-it-works)
│   ├── resume-tips.tsx    # Resume tips (/resume-tips)
│   ├── privacy-policy.tsx # Privacy policy (/privacy-policy)
│   ├── terms-of-service.tsx # Terms (/terms-of-service)
│   ├── forgot-password.tsx  # Password reset (/forgot-password)
│   ├── reset-password.tsx   # Password reset confirmation
│   ├── oauth-callback.tsx   # OAuth callback handler
│   │
│   ├── admin/              # Admin pages
│   │   ├── index.tsx           # Admin dashboard (/admin)
│   │   ├── users.tsx           # User management (/admin/users)
│   │   ├── jobs.tsx            # Job management (/admin/jobs)
│   │   ├── applications.tsx    # Application review (/admin/applications)
│   │   └── ...
│   │
│   ├── jobs/               # Job pages
│   │   ├── index.tsx           # Job listings (/jobs)
│   │   ├── [id].tsx            # Job details (/jobs/:id)
│   │   ├── saved.tsx           # Saved jobs (/jobs/saved)
│   │   └── search.tsx          # Job search (/jobs/search)
│   │
│   └── api/                # API routes (currently unused, direct backend calls)
│
├── lib/                 # Utility functions
│   ├── api.ts              # API endpoints configuration
│   └── types.ts            # TypeScript type definitions
│
└── styles/              # Global styles
    └── globals.css         # Global CSS styles
```

---

## 3. Core Components

### 3.1 Layout Component (`Layout.tsx`)

**Purpose**: Wraps all user-facing pages with consistent navbar and footer

**Features**:
- Responsive navigation bar
- User authentication state management
- Footer with links
- Page container with proper spacing

**Usage**:
```tsx
<Layout>
  <YourPageContent />
</Layout>
```

**Key Functionality**:
- Checks for JWT token in localStorage
- Displays user info if logged in
- Shows login/signup buttons if not authenticated
- Mobile-responsive hamburger menu

---

### 3.2 AdminLayout Component (`AdminLayout.tsx`)

**Purpose**: Specialized layout for admin pages

**Features**:
- Admin sidebar navigation
- Role verification (admin only)
- Dashboard statistics overview
- Quick action buttons

**Protected Routes**:
- Dashboard
- User Management
- Job Management
- Application Review

**Navigation Items**:
```
├── Dashboard
├── Users
├── Jobs
├── Applications
└── Settings
```

---

### 3.3 Navbar Component (`Navbar.tsx`)

**Purpose**: Main navigation bar

**Features**:
- Logo and site branding
- Navigation links (Home, Jobs, About, Contact)
- User menu (if authenticated)
  - Profile
  - CV Builder
  - Job Alerts
  - Notifications
  - Settings
  - Logout
- Login/Signup buttons (if not authenticated)
- Mobile responsive menu

**State Management**:
```typescript
useState<User | null>(null)  // Current user
useState<boolean>(false)     // Mobile menu toggle
useState<boolean>(false)     // User dropdown toggle
```

---

### 3.4 LoadingOverlay Component (`LoadingOverlay.tsx`)

**Purpose**: Full-screen loading indicator

**Features**:
- Centered spinner
- Semi-transparent backdrop
- Prevents interaction during loading
- Optional loading message

**Usage**:
```tsx
{isLoading && <LoadingOverlay />}
```

---

### 3.5 ErrorBoundary Component (`ErrorBoundary.tsx`)

**Purpose**: Catches React errors and displays fallback UI

**Features**:
- Error catching at component level
- User-friendly error message
- Error logging for debugging
- Graceful degradation

**Implementation**:
```tsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

## 4. Key Pages

### 4.1 Homepage (`index.tsx`)

**Route**: `/`

**Features**:
- Hero section with call-to-action
- Job search bar
- Featured jobs section
- Statistics (total jobs, companies, users)
- How it works section
- Testimonials
- Footer with links

**Key Elements**:
```tsx
<HeroSection>
  <SearchBar onSearch={handleSearch} />
</HeroSection>
<FeaturedJobs jobs={featuredJobs} />
<Statistics stats={systemStats} />
<HowItWorks />
```

---

### 4.2 Login Page (`login.tsx`)

**Route**: `/login`

**Features**:
- Email/password form
- Remember me checkbox
- Forgot password link
- Google OAuth button
- Signup link
- Form validation
- Error handling

**State**:
```typescript
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [error, setError] = useState('')
const [loading, setLoading] = useState(false)
```

**Flow**:
1. User enters credentials
2. Submit → POST `/api/auth/login`
3. Receive JWT token
4. Store in localStorage
5. Redirect to dashboard/profile

---

### 4.3 Signup Page (`signup.tsx`)

**Route**: `/signup`

**Features**:
- Full name, email, password fields
- Password confirmation
- Terms acceptance checkbox
- Google OAuth option
- Login link
- Client-side validation
- Password strength indicator

**Validation**:
- Email format check
- Password min length (6 chars)
- Password match confirmation
- Required field checks

---

### 4.4 Job Listings (`jobs/index.tsx`)

**Route**: `/jobs`

**Features**:
- Grid/List view toggle
- Search bar (title, company, keywords)
- Filters sidebar:
  - Location
  - Job Type (Full-time, Part-time, etc.)
  - Category
  - Salary range
- Sort options (Date, Relevance)
- Pagination
- Save job button
- Quick apply

**Job Card**:
```tsx
<JobCard>
  <CompanyLogo />
  <JobTitle />
  <CompanyName />
  <Location />
  <JobType />
  <Salary />
  <PostedDate />
  <SaveButton />
  <ApplyButton />
</JobCard>
```

**State Management**:
```typescript
const [jobs, setJobs] = useState([])
const [filters, setFilters] = useState({
  location: '',
  jobType: '',
  category: '',
  salary: ''
})
const [page, setPage] = useState(1)
const [loading, setLoading] = useState(false)
```

---

### 4.5 Job Details (`jobs/[id].tsx`)

**Route**: `/jobs/:id`

**Features**:
- Complete job information
- Company details
- Job description
- Requirements
- Benefits
- Deadline indicator
- Apply button
- Save job button
- Share job
- Related jobs section

**Dynamic Route**:
```typescript
export async function getServerSideProps({ params }) {
  const { id } = params
  // Fetch job details
  return { props: { job } }
}
```

**Application Flow**:
1. Click "Apply Now"
2. Select active CV
3. Write cover letter
4. Submit application
5. Confirmation message

---

### 4.6 CV Builder (`cv-builder.tsx`)

**Route**: `/cv-builder`

**Features**:
- Upload CV file (PDF, DOC, DOCX)
- View uploaded CVs list
- Set active CV
- Download CV
- Delete CV
- Edit CV data
- CV status indicator
- CV builder form (manual entry):
  - Personal Information
  - Professional Summary
  - Work Experience
  - Education
  - Skills
  - Languages
  - Certifications

**Upload Process**:
```typescript
const handleUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('cv', file)
  
  const response = await fetch('/api/profiles/cvs/upload', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  // Handle response and AI extraction
}
```

**CV Card**:
```tsx
<CVCard>
  <CVName />
  <UploadDate />
  <Status />
  <IsActive />
  <Actions>
    <SetActiveButton />
    <DownloadButton />
    <EditButton />
    <DeleteButton />
  </Actions>
</CVCard>
```

---

### 4.7 Profile Page (`profile.tsx`)

**Route**: `/profile`

**Features**:
- View/Edit personal information
- Upload profile photo
- Update contact details
- Change email
- Application history
- Saved jobs
- Statistics (applications, saved jobs)

**Form Sections**:
```tsx
<ProfilePhoto />
<PersonalInfo>
  - Full Name
  - Email
  - Phone
  - Date of Birth
  - Gender
  - Location
</PersonalInfo>
<ProfessionalSummary />
```

---

### 4.8 Job Alerts (`job-alerts.tsx`)

**Route**: `/job-alerts`

**Features**:
- Create new alert
- List existing alerts
- Edit alert
- Delete alert
- Toggle active/inactive
- Alert configuration:
  - Keywords
  - Location
  - Job Type
  - Frequency (Daily, Weekly, Instant)

**Alert Card**:
```tsx
<AlertCard>
  <Keywords />
  <Location />
  <JobType />
  <Frequency />
  <IsActive />
  <Actions>
    <EditButton />
    <ToggleButton />
    <DeleteButton />
  </Actions>
</AlertCard>
```

---

### 4.9 Notifications (`notifications.tsx`)

**Route**: `/notifications`

**Features**:
- List all notifications
- Mark as read
- Mark all as read
- Delete notification
- Filter (All, Unread, Job Matches)
- Notification types:
  - New job match
  - Application status update
  - Deadline reminder
  - System notification

**Notification Item**:
```tsx
<NotificationItem>
  <Icon type={notification.type} />
  <Message />
  <Timestamp />
  <Actions>
    <MarkReadButton />
    <DeleteButton />
  </Actions>
</NotificationItem>
```

---

### 4.10 Admin Dashboard (`admin/index.tsx`)

**Route**: `/admin`

**Protected**: Admin role only

**Features**:
- System statistics cards:
  - Total Users
  - Active Jobs
  - Pending Applications
  - Total Applications
- Recent activity feed
- Quick actions
- Charts and graphs
- System health status

**Dashboard Cards**:
```tsx
<StatCard>
  <Icon />
  <Value />
  <Label />
  <Change percentage={+10} />
</StatCard>
```

---

### 4.11 Admin User Management (`admin/users.tsx`)

**Route**: `/admin/users`

**Features**:
- User list table
- Search users
- Filter by role (User, Admin)
- User details modal
- Activate/Deactivate user
- View user applications
- User statistics

**Table Columns**:
- ID
- Full Name
- Email
- Role
- Status (Active/Inactive)
- Created Date
- Actions

---

### 4.12 Admin Job Management (`admin/jobs.tsx`)

**Route**: `/admin/jobs`

**Features**:
- Job list table
- Create new job
- Edit job
- Delete job
- Toggle job status (Active/Closed)
- View applications
- Upload company logo
- Bulk actions

**Job Form Fields**:
```typescript
{
  title: string
  company: string
  location: string
  salary: string
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  category: string
  description: string
  requirements: string
  deadline: Date
  contactEmail: string
  contactPhone: string
  website: string
  logo: File
}
```

---

### 4.13 Admin Application Review (`admin/applications.tsx`)

**Route**: `/admin/applications`

**Features**:
- Application list
- Filter by status
- Filter by job
- View applicant profile
- View CV
- Update application status
- Add review notes
- Bulk status updates

**Application Status Flow**:
```
Pending → Reviewed → Accepted/Rejected
```

---

## 5. API Integration Layer

### 5.1 API Configuration (`lib/api.ts`)

**Base URL**: Configured via environment variable
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
```

**All Endpoints**:
```typescript
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',
  CHANGE_PASSWORD: '/api/auth/change-password',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  
  // Jobs
  JOBS: '/api/jobs',
  JOB_DETAIL: (id) => `/api/jobs/${id}`,
  JOB_SEARCH: '/api/jobs/search',
  
  // Applications
  APPLICATIONS: '/api/applications',
  APPLICATION_DETAIL: (id) => `/api/applications/${id}`,
  CHECK_APPLICATION: (jobId) => `/api/applications/check/${jobId}`,
  MANUAL_APPLICATION: '/api/applications/manual',
  
  // Profile & CVs
  PROFILE: '/api/profiles',
  UPLOAD_CV: '/api/profiles/cvs/upload',
  CVS: '/api/profiles/cvs',
  CV_DETAIL: (id) => `/api/profiles/cvs/${id}`,
  SET_ACTIVE_CV: (id) => `/api/profiles/cvs/${id}/set-active`,
  DELETE_CV: (id) => `/api/profiles/cvs/${id}`,
  
  // Job Alerts
  JOB_ALERTS: '/api/job-alerts',
  JOB_ALERT_DETAIL: (id) => `/api/job-alerts/${id}`,
  TOGGLE_ALERT: (id) => `/api/job-alerts/${id}/toggle`,
  
  // Saved Jobs
  SAVED_JOBS: '/api/saved-jobs',
  SAVE_JOB: '/api/saved-jobs',
  UNSAVE_JOB: (jobId) => `/api/saved-jobs/${jobId}`,
  CHECK_SAVED: (jobId) => `/api/saved-jobs/check/${jobId}`,
  
  // Notifications
  NOTIFICATIONS: '/api/notifications',
  MARK_READ: (id) => `/api/notifications/${id}/read`,
  MARK_ALL_READ: '/api/notifications/mark-all-read',
  DELETE_NOTIFICATION: (id) => `/api/notifications/${id}`,
  
  // Admin
  ADMIN_STATS: '/api/admin/stats',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_JOBS: '/api/admin/jobs',
  ADMIN_APPLICATIONS: '/api/admin/applications',
  TOGGLE_USER_STATUS: (id) => `/api/admin/users/${id}/toggle-status`,
  UPDATE_APP_STATUS: (id) => `/api/admin/applications/${id}/status`,
  
  // Contact
  CONTACT: '/api/contact'
}
```

---

### 5.2 Authentication Helper

**Token Management**:
```typescript
// Store token
localStorage.setItem('token', response.data.access_token)

// Get token
const token = localStorage.getItem('token')

// Remove token
localStorage.removeItem('token')

// Add to request headers
headers: {
  'Authorization': `Bearer ${token}`
}
```

**Protected Route HOC**:
```typescript
export function withAuth(Component) {
  return function ProtectedRoute(props) {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    
    useEffect(() => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
      } else {
        verifyToken(token).then(setIsAuthenticated)
      }
    }, [])
    
    if (!isAuthenticated) return <LoadingOverlay />
    
    return <Component {...props} />
  }
}
```

---

## 6. State Management

### 6.1 Local State (useState)

Used for component-level state:
- Form inputs
- Loading states
- Error messages
- Modal visibility
- Dropdown toggles

**Example**:
```typescript
const [formData, setFormData] = useState({
  email: '',
  password: ''
})
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
```

---

### 6.2 Global State (Context API)

**AuthContext**:
```typescript
const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  
  const login = async (email, password) => {
    // Login logic
    setUser(userData)
  }
  
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
```

---

### 6.3 Server State

**Data fetching pattern**:
```typescript
useEffect(() => {
  async function fetchData() {
    setLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.JOBS)
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [dependency])
```

---

## 7. Styling Architecture

### 7.1 Global Styles (`styles/globals.css`)

**CSS Variables**:
```css
:root {
  --primary-color: #0070f3;
  --secondary-color: #ff4081;
  --text-color: #333;
  --bg-color: #ffffff;
  --border-color: #e0e0e0;
  --success-color: #4caf50;
  --error-color: #f44336;
  --warning-color: #ff9800;
}
```

**Global Reset**:
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  color: var(--text-color);
  background: var(--bg-color);
}
```

---

### 7.2 CSS Modules

**Component-scoped styles**:
```tsx
// Component.module.css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

// Component.tsx
import styles from './Component.module.css'

export function Component() {
  return <div className={styles.container}>...</div>
}
```

---

### 7.3 Responsive Design

**Breakpoints**:
```css
/* Mobile First */
.container {
  width: 100%;
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

---

## 8. Form Handling

### 8.1 Controlled Components

```typescript
const [formData, setFormData] = useState({
  email: '',
  password: ''
})

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  })
}

const handleSubmit = async (e) => {
  e.preventDefault()
  // Submit logic
}

return (
  <form onSubmit={handleSubmit}>
    <input
      name="email"
      value={formData.email}
      onChange={handleChange}
    />
  </form>
)
```

---

### 8.2 Form Validation

**Client-side validation**:
```typescript
const validateForm = () => {
  const errors = {}
  
  if (!formData.email) {
    errors.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email is invalid'
  }
  
  if (!formData.password) {
    errors.password = 'Password is required'
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }
  
  return errors
}
```

---

### 8.3 File Uploads

**CV Upload Example**:
```typescript
const handleFileUpload = async (e) => {
  const file = e.target.files[0]
  
  if (!file) return
  
  // Validate file type
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (!allowedTypes.includes(file.type)) {
    setError('Only PDF and DOC files are allowed')
    return
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    setError('File size must be less than 5MB')
    return
  }
  
  const formData = new FormData()
  formData.append('cv', file)
  
  setLoading(true)
  try {
    const response = await fetch(API_ENDPOINTS.UPLOAD_CV, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      setCVs([...cvs, data])
      setSuccess('CV uploaded successfully')
    }
  } catch (error) {
    setError('Upload failed')
  } finally {
    setLoading(false)
  }
}
```

---

## 9. Routing

### 9.1 Page Routes

Next.js file-based routing:

| File Path | Route | Description |
|-----------|-------|-------------|
| `pages/index.tsx` | `/` | Homepage |
| `pages/login.tsx` | `/login` | Login page |
| `pages/jobs/index.tsx` | `/jobs` | Job listings |
| `pages/jobs/[id].tsx` | `/jobs/:id` | Job details |
| `pages/admin/index.tsx` | `/admin` | Admin dashboard |

---

### 9.2 Dynamic Routes

**Job Details**:
```typescript
// pages/jobs/[id].tsx
import { useRouter } from 'next/router'

export default function JobDetail() {
  const router = useRouter()
  const { id } = router.query
  
  useEffect(() => {
    fetchJob(id)
  }, [id])
}
```

---

### 9.3 Programmatic Navigation

```typescript
import { useRouter } from 'next/router'

const router = useRouter()

// Navigate to page
router.push('/jobs')

// Navigate with params
router.push(`/jobs/${jobId}`)

// Navigate with query
router.push({
  pathname: '/jobs',
  query: { category: 'tech' }
})

// Go back
router.back()
```

---

## 10. Error Handling

### 10.1 API Error Handling

```typescript
const handleApiCall = async () => {
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    if (error.response) {
      // Server responded with error
      setError(error.response.data.message)
    } else if (error.request) {
      // Request made but no response
      setError('Network error. Please check your connection.')
    } else {
      // Other errors
      setError('An unexpected error occurred.')
    }
  }
}
```

---

### 10.2 User Feedback

**Success Messages**:
```typescript
const [success, setSuccess] = useState('')

{success && (
  <div className="success-message">
    {success}
  </div>
)}
```

**Error Messages**:
```typescript
const [error, setError] = useState('')

{error && (
  <div className="error-message">
    {error}
  </div>
)}
```

---

## 11. Performance Optimization

### 11.1 Code Splitting

Next.js automatic code splitting per route

### 11.2 Image Optimization

```typescript
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority
/>
```

### 11.3 Lazy Loading

```typescript
import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(() => import('../components/Heavy'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})
```

---

## 12. User Experience Features

### 12.1 Loading States

- Skeleton screens
- Progress indicators
- Loading overlays
- Spinner animations

### 12.2 Toast Notifications

```typescript
const showToast = (message, type = 'success') => {
  setToast({ message, type, visible: true })
  setTimeout(() => setToast({ visible: false }), 3000)
}
```

### 12.3 Confirmation Dialogs

```typescript
const handleDelete = () => {
  if (confirm('Are you sure you want to delete this?')) {
    deleteItem()
  }
}
```

---

## 13. Accessibility

### 13.1 Semantic HTML

```tsx
<header>
  <nav>
    <a href="/">Home</a>
  </nav>
</header>

<main>
  <article>
    <h1>Title</h1>
    <p>Content</p>
  </article>
</main>

<footer>
  <p>&copy; 2026 WebCV</p>
</footer>
```

### 13.2 ARIA Labels

```tsx
<button aria-label="Close menu">
  <CloseIcon />
</button>

<input aria-required="true" aria-invalid={hasError} />
```

### 13.3 Keyboard Navigation

- Tab order
- Focus states
- Escape key handling
- Enter key submission

---

## 14. Environment Configuration

### 14.1 Environment Variables

**`.env.local`**:
```env
NEXT_PUBLIC_API_URL=https://king-prawn-app-j2i4c.ondigitalocean.app
```

**Usage**:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

**Note**: `NEXT_PUBLIC_` prefix required for client-side access

---

## 15. Build & Deployment

### 15.1 Development

```bash
npm run dev
# Runs on http://localhost:3000
```

### 15.2 Production Build

```bash
npm run build
npm run start
```

### 15.3 Export Static Site

```bash
npm run build
npm run export
```

---

## 16. TypeScript Types (`lib/types.ts`)

```typescript
export interface User {
  id: string
  email: string
  fullname: string
  role: 'user' | 'admin'
  created_at: string
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  salary: string
  job_type: string
  category: string
  description: string
  requirements: string
  deadline: string
  posted_date: string
  status: 'active' | 'closed'
}

export interface Application {
  id: string
  user_id: string
  job_id: string
  cv_id: string
  cover_letter: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  applied_date: string
}

export interface CV {
  id: string
  profile_id: string
  name: string
  file_path: string
  status: string
  is_active: boolean
  upload_date: string
  extracted_data?: any
}

export interface JobAlert {
  id: string
  user_id: string
  keywords: string
  location: string
  job_type: string
  frequency: 'daily' | 'weekly' | 'instant'
  is_active: boolean
}

export interface Notification {
  id: string
  user_id: string
  job_id: string
  notification_type: string
  message: string
  is_read: boolean
  created_at: string
}
```

---

## 17. Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 18. Frontend Best Practices

### 18.1 Component Design
- Single Responsibility Principle
- Reusable components
- Props validation
- Default props

### 18.2 State Management
- Minimize state
- Lift state up when needed
- Use Context for global state
- Keep state close to where it's used

### 18.3 Performance
- Memoization (useMemo, useCallback)
- Avoid unnecessary re-renders
- Optimize images
- Code splitting

### 18.4 Security
- XSS prevention (sanitize inputs)
- CSRF protection (token-based)
- Secure token storage
- HTTPS only

---

## 19. Development Workflow

1. **Feature Development**
   - Create feature branch
   - Develop component
   - Test locally
   - Create pull request

2. **Code Review**
   - Review code quality
   - Check TypeScript types
   - Verify functionality
   - Merge to main

3. **Testing**
   - Manual testing
   - Cross-browser testing
   - Mobile responsive testing
   - Integration testing

4. **Deployment**
   - Build production bundle
   - Deploy to hosting
   - Monitor for errors
   - User feedback

---

## 20. Future Frontend Improvements

- [ ] Unit testing (Jest, React Testing Library)
- [ ] E2E testing (Playwright, Cypress)
- [ ] Storybook for component documentation
- [ ] Progressive Web App (PWA) features
- [ ] Advanced state management (Zustand/Redux)
- [ ] Real-time features (WebSockets)
- [ ] Internationalization (i18n)
- [ ] Dark mode theme
- [ ] Offline support
- [ ] Service worker caching

---

## Conclusion

The WebCV frontend is a modern, type-safe React application built with Next.js that provides an intuitive user interface for job seekers and administrators. With 20+ pages, 6+ reusable components, and comprehensive API integration, it delivers a seamless user experience while maintaining code quality and performance.

**Key Frontend Strengths**:
✅ TypeScript for type safety  
✅ Component-based architecture  
✅ Responsive design  
✅ Clean code organization  
✅ Comprehensive error handling  
✅ Optimized performance  
✅ Accessible UI  
✅ Production-ready deployment

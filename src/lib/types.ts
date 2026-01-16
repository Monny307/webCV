// User types
export interface User {
  id: string
  email: string
  fullname: string
  role: 'user' | 'admin'
}

// CV/Profile types
export interface ProfileData {
  fullname?: string
  email?: string
  phone?: string
  gender?: string
  dob?: string
  location?: string
}

export interface Education {
  degree: string
  institution: string
  year: string
}

export interface Experience {
  title: string
  company: string
  duration: string
  description: string
}

export interface Language {
  language: string
  proficiency: string
}

export interface Certification {
  name: string
  organization: string
  year: string
}

export interface CV {
  id: string
  name: string
  uploadDate: string
  status: 'completed' | 'needs-editing'
  isActive: boolean
}

// Job types
export interface Job {
  id: string
  title: string
  company: string
  location: string
  salary: string
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  category: string
  description: string
  requirements: string
  logo?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  status: 'active' | 'inactive'
  postedDate?: string
}

// Application types
export interface Application {
  id: string
  jobId: string
  job: Job
  status: 'applied' | 'interview' | 'offer' | 'rejected'
  appliedDate: string
}

// Job Alert types
export interface JobAlert {
  id: string
  title: string
  keywords?: string
  location?: string
  category?: string
  jobType?: string
  salaryMin?: number
  salaryMax?: number
  frequency: 'instant' | 'daily' | 'weekly'
  createdDate: string
  newJobsCount?: number
}

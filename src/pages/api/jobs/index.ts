import type { NextApiRequest, NextApiResponse } from 'next'
import { Job } from '@/lib/types'

// Mock job data
const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Tech Corp Inc.',
    location: 'Phnom Penh',
    salary: '$1200 - $1800',
    jobType: 'Full-time',
    category: 'Technology',
    description: 'We are looking for an experienced software engineer to join our team.',
    requirements: 'Bachelor\'s degree in Computer Science, 5+ years experience',
    logo: 'https://logo.clearbit.com/google.com',
    status: 'active',
    postedDate: '2024-12-01'
  },
  {
    id: '2',
    title: 'Marketing Manager',
    company: 'Digital Marketing Pro',
    location: 'Siem Reap',
    salary: '$800 - $1200',
    jobType: 'Full-time',
    category: 'Marketing',
    description: 'Lead our marketing team and drive digital campaigns.',
    requirements: '3+ years in marketing management',
    logo: 'https://logo.clearbit.com/hubspot.com',
    status: 'active',
    postedDate: '2024-12-02'
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    company: 'Creative Studio',
    location: 'Remote',
    salary: '$600 - $1000',
    jobType: 'Part-time',
    category: 'Design',
    description: 'Design beautiful user interfaces and experiences.',
    requirements: 'Portfolio required, 2+ years experience',
    logo: 'https://logo.clearbit.com/figma.com',
    status: 'active',
    postedDate: '2024-12-03'
  },
  {
    id: '4',
    title: 'Data Analyst',
    company: 'Analytics Solutions',
    location: 'Battambang',
    salary: '$700 - $1100',
    jobType: 'Full-time',
    category: 'Technology',
    description: 'Analyze data and provide insights to drive business decisions.',
    requirements: 'SQL, Python, statistics background',
    logo: 'https://logo.clearbit.com/tableau.com',
    status: 'active',
    postedDate: '2024-12-04'
  },
  {
    id: '5',
    title: 'Sales Representative',
    company: 'Sales Masters',
    location: 'Sihanoukville',
    salary: '$500 - $800',
    jobType: 'Full-time',
    category: 'Sales',
    description: 'Build relationships with clients and drive sales.',
    requirements: '1+ years sales experience',
    logo: 'https://logo.clearbit.com/salesforce.com',
    status: 'active',
    postedDate: '2024-12-05'
  },
  {
    id: '6',
    title: 'Financial Analyst',
    company: 'Finance Group',
    location: 'Phnom Penh',
    salary: '$1000 - $1500',
    jobType: 'Full-time',
    category: 'Finance',
    description: 'Perform financial analysis and reporting.',
    requirements: 'CFA or accounting degree preferred',
    logo: 'https://logo.clearbit.com/bloomberg.com',
    status: 'active',
    postedDate: '2024-12-06'
  }
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Filter jobs based on query parameters
    const { category, location, jobType, search } = req.query
    
    let filteredJobs = [...MOCK_JOBS]

    if (category) {
      filteredJobs = filteredJobs.filter(job => 
        job.category.toLowerCase() === (category as string).toLowerCase()
      )
    }

    if (location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes((location as string).toLowerCase())
      )
    }

    if (jobType) {
      filteredJobs = filteredJobs.filter(job => 
        job.jobType.toLowerCase() === (jobType as string).toLowerCase()
      )
    }

    if (search) {
      const searchTerm = (search as string).toLowerCase()
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm)
      )
    }

    return res.status(200).json({
      success: true,
      jobs: filteredJobs,
      total: filteredJobs.length
    })
  }

  if (req.method === 'POST') {
    // Create new job (admin only)
    const newJob: Job = {
      id: Math.random().toString(36).substring(2, 11),
      ...req.body,
      postedDate: new Date().toISOString().split('T')[0]
    }

    MOCK_JOBS.push(newJob)

    return res.status(201).json({
      success: true,
      job: newJob
    })
  }

  return res.status(405).json({ message: 'Method not allowed' })
}

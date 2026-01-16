import type { NextApiRequest, NextApiResponse } from 'next'
import { Application } from '@/lib/types'

const MOCK_APPLICATIONS: Application[] = [
  {
    id: '1',
    jobId: '1',
    job: {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Tech Corp Inc.',
      location: 'Phnom Penh',
      salary: '$1200 - $1800',
      jobType: 'Full-time',
      category: 'Technology',
      description: '',
      requirements: '',
      logo: 'https://logo.clearbit.com/google.com',
      status: 'active'
    },
    status: 'interview',
    appliedDate: '2024-11-25'
  },
  {
    id: '2',
    jobId: '2',
    job: {
      id: '2',
      title: 'Marketing Manager',
      company: 'Digital Marketing Pro',
      location: 'Siem Reap',
      salary: '$800 - $1200',
      jobType: 'Full-time',
      category: 'Marketing',
      description: '',
      requirements: '',
      status: 'active'
    },
    status: 'applied',
    appliedDate: '2024-12-01'
  }
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      applications: MOCK_APPLICATIONS
    })
  }

  if (req.method === 'POST') {
    const newApplication: Application = {
      id: Math.random().toString(36).substring(2, 11),
      ...req.body,
      status: 'applied',
      appliedDate: new Date().toISOString().split('T')[0]
    }

    MOCK_APPLICATIONS.push(newApplication)

    return res.status(201).json({
      success: true,
      application: newApplication
    })
  }

  return res.status(405).json({ message: 'Method not allowed' })
}

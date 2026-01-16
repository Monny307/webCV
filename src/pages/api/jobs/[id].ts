import type { NextApiRequest, NextApiResponse } from 'next'

// This would normally fetch from database
const MOCK_JOB = {
  id: '1',
  title: 'Senior Software Engineer',
  company: 'Tech Corp Inc.',
  location: 'Phnom Penh',
  salary: '$1200 - $1800',
  jobType: 'Full-time',
  category: 'Technology',
  description: 'We are looking for an experienced software engineer to join our dynamic team. You will work on cutting-edge technologies and challenging projects.',
  requirements: `- Bachelor's degree in Computer Science or related field
- 5+ years of professional software development experience
- Strong proficiency in JavaScript, TypeScript, and modern frameworks
- Experience with cloud platforms (AWS, GCP, or Azure)
- Excellent problem-solving and communication skills`,
  responsibilities: `- Design and develop scalable web applications
- Collaborate with cross-functional teams
- Write clean, maintainable code
- Mentor junior developers
- Participate in code reviews`,
  benefits: `- Competitive salary
- Health insurance
- Flexible working hours
- Remote work options
- Professional development opportunities`,
  logo: 'https://logo.clearbit.com/google.com',
  status: 'active',
  postedDate: '2024-12-01'
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    // Return job details
    return res.status(200).json({
      success: true,
      job: { ...MOCK_JOB, id }
    })
  }

  if (req.method === 'PUT') {
    // Update job (admin only)
    const updatedJob = {
      ...MOCK_JOB,
      id,
      ...req.body
    }

    return res.status(200).json({
      success: true,
      job: updatedJob
    })
  }

  if (req.method === 'DELETE') {
    // Delete job (admin only)
    return res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    })
  }

  return res.status(405).json({ message: 'Method not allowed' })
}

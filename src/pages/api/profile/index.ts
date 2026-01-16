import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return mock profile data
    const mockProfile = {
      personalDetails: {
        fullname: 'John Doe',
        email: 'john@example.com',
        phone: '+855 12 345 678',
        gender: 'Male',
        dob: '1990-01-15',
        location: 'Phnom Penh, Cambodia'
      },
      education: [
        {
          degree: 'Bachelor of Computer Science',
          institution: 'Royal University of Phnom Penh',
          year: '2012'
        }
      ],
      experience: [
        {
          title: 'Software Engineer',
          company: 'Tech Company',
          duration: '2020 - Present',
          description: 'Developed web applications using React and Node.js'
        }
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
      languages: [
        { language: 'English', proficiency: 'Fluent' },
        { language: 'Khmer', proficiency: 'Native' }
      ],
      certifications: [
        {
          name: 'AWS Certified Developer',
          organization: 'Amazon Web Services',
          year: '2021'
        }
      ],
      summary: 'Experienced software engineer with 5+ years in web development.'
    }

    return res.status(200).json({
      success: true,
      profile: mockProfile
    })
  }

  if (req.method === 'PUT') {
    // Update profile
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: req.body
    })
  }

  return res.status(405).json({ message: 'Method not allowed' })
}

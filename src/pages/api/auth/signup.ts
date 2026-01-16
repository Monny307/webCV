import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { fullname, email, password } = req.body

  // Validate input
  if (!fullname || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    })
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters'
    })
  }

  // Mock successful signup
  const newUser = {
    id: Math.random().toString(36).substring(2, 11),
    fullname,
    email,
    role: 'user' as const
  }

  return res.status(201).json({
    success: true,
    message: 'Account created successfully',
    user: newUser
  })
}

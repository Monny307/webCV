import type { NextApiRequest, NextApiResponse } from 'next'

const DEMO_ACCOUNTS = {
  user: {
    id: '1',
    email: 'user@demo.com',
    password: 'user123',
    fullname: 'Demo User',
    role: 'user' as const
  },
  admin: {
    id: '2',
    email: 'admin@demo.com',
    password: 'admin123',
    fullname: 'Admin User',
    role: 'admin' as const
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, password } = req.body

  // Check credentials
  const user = Object.values(DEMO_ACCOUNTS).find(
    account => account.email === email && account.password === password
  )

  if (user) {
    const { password: _, ...userWithoutPassword } = user
    return res.status(200).json({
      success: true,
      user: userWithoutPassword
    })
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid credentials'
  })
}

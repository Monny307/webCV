import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import FormData from 'form-data'
import fs from 'fs'
import fetch from 'node-fetch'

// Disable Next.js body parsing so we can handle file upload
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
    })

    const [fields, files] = await form.parse(req)
    const file = Array.isArray(files.file) ? files.file[0] : files.file

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    console.log('📤 Proxying file to ML API:', file.originalFilename, file.mimetype, file.size)

    // Create form data to send to ML API
    const formData = new FormData()
    formData.append('file', fs.createReadStream(file.filepath), {
      filename: file.originalFilename || 'resume.pdf',
      contentType: file.mimetype || 'application/pdf',
    })

    // Forward request to ML API
    const mlResponse = await fetch('http://138.197.13.244:8000/upload', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
      timeout: 180000, // 3 minute timeout
    })

    console.log('📥 ML API Response:', mlResponse.status, mlResponse.statusText)

    // Clean up uploaded file
    fs.unlinkSync(file.filepath)

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text()
      console.error('❌ ML API Error:', errorText)
      return res.status(mlResponse.status).json({ 
        error: `ML API error: ${errorText}` 
      })
    }

    const data = await mlResponse.json()
    console.log('✅ ML API Success - Recommendations:', data.recommendations?.length || 0)

    // Return the ML API response
    return res.status(200).json(data)

  } catch (error: any) {
    console.error('❌ Proxy error:', error)
    
    // Clean up file if it exists
    try {
      const form = formidable()
      const [, files] = await form.parse(req)
      const file = Array.isArray(files.file) ? files.file[0] : files.file
      if (file && fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath)
      }
    } catch {}

    return res.status(500).json({ 
      error: error.message || 'Failed to process CV',
      details: error.toString()
    })
  }
}

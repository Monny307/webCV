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

        console.log('📤 Proxying CV to Flask backend:', file.originalFilename, file.mimetype, file.size)

        // Get authorization token from request headers
        const authHeader = req.headers.authorization

        // Create form data to send to Flask backend
        const formData = new FormData()
        formData.append('file', fs.createReadStream(file.filepath), {
            filename: file.originalFilename || 'resume.pdf',
            contentType: file.mimetype || 'application/pdf',
        })

        // Get backend URL from environment or use default
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const apiUrl = `${backendUrl}/api/analyze-cv`

        console.log('🔗 Forwarding to:', apiUrl)

        // Forward request to Flask backend
        const headers: any = formData.getHeaders()
        if (authHeader) {
            headers['Authorization'] = authHeader
        }

        const backendResponse = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
            headers,
            timeout: 180000, // 3 minute timeout
        })

        console.log('📥 Backend Response:', backendResponse.status, backendResponse.statusText)

        // Clean up uploaded file
        fs.unlinkSync(file.filepath)

        if (!backendResponse.ok) {
            const errorText = await backendResponse.text()
            console.error('❌ Backend Error:', errorText)
            return res.status(backendResponse.status).json({
                error: `Backend error: ${errorText}`
            })
        }

        const data = await backendResponse.json()
        console.log('✅ CV Analysis Success')

        // Return the backend response
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
        } catch { }

        return res.status(500).json({
            error: error.message || 'Failed to analyze CV',
            details: error.toString()
        })
    }
}

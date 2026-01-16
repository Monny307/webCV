# AhhChip - Next.js Application

This is a Next.js conversion of the AhhChip CV tracking platform.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/src/pages` - Next.js pages
- `/src/components` - Reusable React components
- `/src/styles` - Global and component styles
- `/src/lib` - Utility functions and helpers
- `/public` - Static assets (images, fonts, etc.)

## Mock API

All backend calls are currently using mock API routes located in `/src/pages/api/`.

## Django Integration

The project is structured to easily connect to a Django backend:
- API routes are centralized
- Data models are typed
- Authentication logic is separated

To connect to Django:
1. Update API endpoints in `/src/lib/api.ts`
2. Configure CORS settings
3. Update authentication flow

# French Learning Application

A React-based application for practicing French language skills through interactive speaking exercises.

## Features

- Interactive speaking prompts with timer
- Speech recording and transcription
- Real-time feedback on pronunciation
- Customizable session settings
- User authentication with Clerk
- Data persistence with MongoDB Atlas

## Tech Stack

- Frontend: React + TypeScript
- Authentication: Clerk
- Database: MongoDB Atlas
- Styling: Tailwind CSS
- Build Tool: Vite
- Framework: Astro

## Authentication

The application uses Clerk for user authentication and management. All routes are protected by default, requiring users to sign in to access the application features. Authentication is implemented using:

- Clerk React components for UI
- Middleware protection for all routes
- Secure session management
- MongoDB integration for user data storage

## Project Structure

```
src/
├── components/          # React components
├── data/               # Static data and prompts
├── db/                 # Database configuration
├── layouts/            # Page layouts
├── lib/                # Utility functions
├── models/             # Data models
├── pages/              # Route pages
├── types/              # TypeScript type definitions
└── middleware.ts       # Auth middleware
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   ```
   PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   MONGODB_URI=your_mongodb_uri
   ```
4. Run the development server: `npm run dev`

## Environment Variables

- `PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key
- `CLERK_SECRET_KEY`: Clerk secret key
- `MONGODB_URI`: MongoDB Atlas connection string

## Authentication Flow

1. Users must sign in to access any application features
2. Unauthenticated users are redirected to /sign-in
3. After authentication, users can access:
   - Speaking practice sessions
   - Session history
   - Profile settings

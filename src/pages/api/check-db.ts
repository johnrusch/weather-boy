import type { APIRoute } from 'astro';
import { connectDB } from '../../lib/db';

export const GET: APIRoute = async () => {
  try {
    const dbStatus = await connectDB();
    return new Response(JSON.stringify({ 
      connected: dbStatus, 
      offlineMode: global.isOfflineMode 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error checking DB connection:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to check database connection',
      message: error instanceof Error ? error.message : 'Unknown error',
      connected: false,
      offlineMode: global.isOfflineMode
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

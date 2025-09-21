import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/clerk-server';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Since we're using localStorage, this API route is not needed
    // Documents are managed client-side
    return NextResponse.json({
      success: true,
      documents: [],
      message: 'Documents are managed client-side using localStorage'
    });

  } catch (error) {
    console.error('Error getting documents:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get documents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

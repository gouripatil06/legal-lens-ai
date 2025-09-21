import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/clerk-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documentId = params.id;

    // Since we're using localStorage, this API route is not needed
    // Documents are managed client-side
    return NextResponse.json({
      success: true,
      message: 'Documents are managed client-side using localStorage',
      documentId: documentId
    });

  } catch (error) {
    console.error('Error getting document:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

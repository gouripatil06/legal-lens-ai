import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/clerk-server';
import { getUserDocuments } from '@/lib/google-cloud/firestore';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user documents
    const documents = await getUserDocuments(userId);

    return NextResponse.json({
      success: true,
      documents: documents.map(doc => ({
        id: doc.id,
        fileName: doc.fileName,
        summary: doc.summary,
        risks: doc.risks,
        createdAt: doc.createdAt,
      })),
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

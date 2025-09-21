import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/clerk-server';
import { getDocument } from '@/lib/google-cloud/firestore';

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

    // Get document
    const document = await getDocument(documentId, userId);
    if (!document) {
      return NextResponse.json({ 
        error: 'Document not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        fileName: document.fileName,
        summary: document.summary,
        keyPoints: document.keyPoints,
        risks: document.risks,
        actionItems: document.actionItems,
        plainLanguageExplanation: document.plainLanguageExplanation,
        createdAt: document.createdAt,
      },
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

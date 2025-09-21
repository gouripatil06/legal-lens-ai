import { NextRequest, NextResponse } from 'next/server';
import { verifyClerkAuth } from '@/lib/clerk-server';
import { performAdvancedDocumentAnalysis } from '@/lib/google-cloud/advanced-gemini-analysis';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = (await headers()).get("authorization");
    const auth = await verifyClerkAuth(authHeader);
    
    if (auth.error) {
      return auth.error;
    }
    const userId = auth.userId;

    // Get the OCR result from client-side processing
    const { fileName, ocrResult } = await request.json();

    if (!fileName || !ocrResult) {
      return NextResponse.json({ 
        error: 'File name and OCR result are required' 
      }, { status: 400 });
    }

    // Perform advanced analysis with multiple Gemini calls
    const advancedAnalysis = await performAdvancedDocumentAnalysis(
      ocrResult.text,
      fileName
    );

    // Generate a simple document ID (for prototype)
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      documentId,
      fileName,
      analysis: advancedAnalysis,
      ocrResult: {
        confidence: ocrResult.confidence,
        originalText: ocrResult.text,
        entities: ocrResult.entities,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process document', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
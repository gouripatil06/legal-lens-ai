import { NextRequest, NextResponse } from 'next/server';
import { verifyClerkAuth } from '@/lib/clerk-server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = (await headers()).get("authorization");
    const auth = await verifyClerkAuth(authHeader);
    
    if (auth.error) {
      return auth.error;
    }

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64 for client-side processing
    const fileBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(fileBuffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: dataUrl
      },
      message: 'File ready for client-side Tesseract processing'
    });

  } catch (error) {
    console.error('Tesseract test error:', error);
    return NextResponse.json({ 
      error: 'Failed to prepare file for Tesseract', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}



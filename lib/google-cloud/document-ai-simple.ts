import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

const client = new DocumentProcessorServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export interface DocumentAnalysisResult {
  text: string;
  confidence: number;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
}

export async function processDocument(
  fileBuffer: Buffer,
  mimeType: string
): Promise<DocumentAnalysisResult> {
  try {
    const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;
    const location = process.env.DOCUMENT_AI_LOCATION || 'us';

    if (!processorId) {
      throw new Error('Document AI Processor ID not configured');
    }

    const request = {
      name: processorId,
      rawDocument: {
        content: fileBuffer,
        mimeType: mimeType,
      },
    };

    const [result] = await client.processDocument(request);
    const { document } = result;

    if (!document) {
      throw new Error('No document returned from Document AI');
    }

    // Extract text content
    const text = document.text || '';

    // Extract entities (legal terms, dates, amounts, etc.)
    const entities = document.entities?.map(entity => ({
      type: entity.type || 'unknown',
      value: entity.mentionText || '',
      confidence: entity.confidence || 0,
    })) || [];

    // Calculate overall confidence from entities or use default
    const confidence = entities.length > 0 
      ? entities.reduce((sum, entity) => sum + entity.confidence, 0) / entities.length 
      : 0.8;

    return {
      text,
      entities,
      confidence,
    };
  } catch (error) {
    console.error('Error processing document:', error);
    throw new Error(`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

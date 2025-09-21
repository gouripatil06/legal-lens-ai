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

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Unsupported file type. Please upload PDF, DOCX, DOC, or text files.' 
      }, { status: 400 });
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    let extractedText = '';
    let confidence = 0.9;
    let documentType = 'Document';
    let metadata = {
      wordCount: 0,
      language: 'English',
      hasSignatures: false,
      hasFinancialTerms: false,
    };

    // Process based on file type - REAL CONTENT EXTRACTION
    if (file.type === 'application/pdf') {
      // For PDFs, we'll read the raw content and extract what we can
      // This is a simplified approach that works with text-based PDFs
      try {
        const text = fileBuffer.toString('utf-8');
        // Extract readable text from PDF (works for text-based PDFs)
        const lines = text.split('\n').filter(line => 
          line.trim().length > 0 && 
          !line.includes('stream') && 
          !line.includes('endstream') &&
          !line.includes('obj') &&
          !line.includes('endobj') &&
          !line.match(/^\d+\s+\d+\s+obj$/) &&
          !line.match(/^xref$/) &&
          !line.match(/^trailer$/) &&
          !line.match(/^startxref$/)
        );
        
        extractedText = lines.join('\n').trim();
        
        if (extractedText.length < 50) {
          // If we couldn't extract much text, it might be an image-based PDF
          extractedText = `PDF Document: ${file.name}\n\nThis appears to be a PDF document. The content extraction is limited for image-based PDFs. For full text extraction, OCR would be required.\n\nFile size: ${file.size} bytes\nUploaded: ${new Date().toLocaleDateString()}`;
          confidence = 0.3;
        } else {
          confidence = 0.7;
        }
        
        documentType = 'PDF Document';
      } catch (error) {
        console.error('PDF processing error:', error);
        extractedText = `PDF Document: ${file.name}\n\nError processing PDF file. This might be an image-based PDF or corrupted file.\n\nFile size: ${file.size} bytes\nUploaded: ${new Date().toLocaleDateString()}`;
        documentType = 'PDF Document (Processing Error)';
        confidence = 0.2;
      }
      
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For DOCX files, we'll try to extract text from the ZIP structure
      try {
        // DOCX files are ZIP files, we can try to extract text from the XML
        const text = fileBuffer.toString('utf-8');
        // Look for text content in the DOCX structure
        const textMatches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
        if (textMatches) {
          extractedText = textMatches
            .map(match => match.replace(/<[^>]*>/g, ''))
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        } else {
          extractedText = `Word Document: ${file.name}\n\nThis is a Word document (.docx format). Text extraction from DOCX files requires specialized libraries.\n\nFile size: ${file.size} bytes\nUploaded: ${new Date().toLocaleDateString()}`;
        }
        
        documentType = 'Word Document';
        confidence = extractedText.length > 100 ? 0.8 : 0.4;
      } catch (error) {
        console.error('DOCX processing error:', error);
        extractedText = `Word Document: ${file.name}\n\nError processing DOCX file.\n\nFile size: ${file.size} bytes\nUploaded: ${new Date().toLocaleDateString()}`;
        documentType = 'Word Document (Processing Error)';
        confidence = 0.2;
      }
      
    } else if (file.type === 'application/msword') {
      // For old DOC files
      extractedText = `Legacy Word Document: ${file.name}\n\nThis is a legacy Word document (.doc format) which requires special processing libraries.\n\nFile size: ${file.size} bytes\nUploaded: ${new Date().toLocaleDateString()}\n\nFor full text extraction, specialized .doc parsing libraries would be required.`;
      documentType = 'Legacy Word Document';
      confidence = 0.3;
      
    } else if (file.type === 'text/plain' || file.type === 'text/csv') {
      extractedText = fileBuffer.toString('utf-8');
      documentType = 'Text Document';
      confidence = 0.95;
      
    } else if (file.type.startsWith('image/')) {
      extractedText = `Image Document: ${file.name}\n\nThis is an image file. For text extraction, OCR (Optical Character Recognition) would be required.\n\nFile size: ${file.size} bytes\nUploaded: ${new Date().toLocaleDateString()}\n\nTo extract text from images, OCR libraries like Tesseract.js would be needed.`;
      documentType = 'Image Document';
      confidence = 0.1;
      
    } else {
      // For other file types, try to read as text
      try {
        extractedText = fileBuffer.toString('utf-8');
        documentType = 'Text Document';
        confidence = 0.8;
      } catch (error) {
        extractedText = `Unknown Document: ${file.name}\n\nFile type: ${file.type}\nFile size: ${file.size} bytes\nUploaded: ${new Date().toLocaleDateString()}\n\nThis file type is not supported for text extraction.`;
        documentType = 'Unknown Document';
        confidence = 0.1;
      }
    }

    // Calculate metadata
    metadata.wordCount = extractedText.split(/\s+/).length;
    metadata.hasSignatures = /signature|signed|witness/i.test(extractedText);
    metadata.hasFinancialTerms = /₹|\$|rupee|dollar|payment|fee|cost|price/i.test(extractedText);
    
    // Detect document type from content
    if (/contract|agreement/i.test(extractedText)) {
      documentType = 'Contract Agreement';
    } else if (/lease|rental/i.test(extractedText)) {
      documentType = 'Lease Agreement';
    } else if (/employment|job|salary/i.test(extractedText)) {
      documentType = 'Employment Document';
    } else if (/nda|confidentiality|non-disclosure/i.test(extractedText)) {
      documentType = 'Non-Disclosure Agreement';
    } else if (/terms|service|conditions/i.test(extractedText)) {
      documentType = 'Terms of Service';
    }

    // Extract entities from the actual text
    const entities = extractEntitiesFromText(extractedText);

    return NextResponse.json({
      success: true,
      extractedText: extractedText.trim(),
      confidence,
      entities,
      documentType,
      metadata,
    });

  } catch (error) {
    console.error('Document processing error:', error);
    return NextResponse.json({ 
      error: 'Failed to process document', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Extract entities from actual text content
function extractEntitiesFromText(text: string): Array<{ type: string; value: string; confidence: number }> {
  const entities: Array<{ type: string; value: string; confidence: number }> = [];
  
  // Extract amounts
  const amountRegex = /[₹$€£]\s*\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:rupees?|dollars?|euros?|pounds?|lakh|crore)/gi;
  const amounts = text.match(amountRegex);
  if (amounts) {
    amounts.forEach(amount => {
      entities.push({ type: 'amount', value: amount.trim(), confidence: 0.95 });
    });
  }
  
  // Extract dates
  const dateRegex = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b|\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b/gi;
  const dates = text.match(dateRegex);
  if (dates) {
    dates.forEach(date => {
      entities.push({ type: 'date', value: date.trim(), confidence: 0.9 });
    });
  }
  
  // Extract emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex);
  if (emails) {
    emails.forEach(email => {
      entities.push({ type: 'email', value: email.trim(), confidence: 0.98 });
    });
  }
  
  // Extract phone numbers
  const phoneRegex = /(?:\+91[-\s]?)?[0-9]{10}|(?:\+91[-\s]?)?[0-9]{5}[-\s]?[0-9]{5}/g;
  const phones = text.match(phoneRegex);
  if (phones) {
    phones.forEach(phone => {
      entities.push({ type: 'phone', value: phone.trim(), confidence: 0.9 });
    });
  }
  
  // Extract legal terms
  const legalTerms = ['agreement', 'contract', 'terms', 'conditions', 'liability', 'warranty', 'indemnity', 'breach', 'termination', 'governing law', 'jurisdiction', 'arbitration', 'confidentiality', 'non-compete', 'force majeure'];
  legalTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    if (regex.test(text)) {
      entities.push({ type: 'legal_term', value: term, confidence: 0.8 });
    }
  });
  
  return entities;
}

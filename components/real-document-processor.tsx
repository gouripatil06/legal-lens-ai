'use client';

import { useState } from 'react';
import { convertPDFToImages, PDFConversionResult } from '@/lib/pdf-to-images';
import Tesseract from 'tesseract.js';

export interface RealDocumentResult {
  text: string;
  confidence: number;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  documentType: string;
  metadata: {
    pageCount?: number;
    wordCount: number;
    language: string;
    hasSignatures: boolean;
    hasFinancialTerms: boolean;
  };
}

export function useRealDocumentProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processFile = async (
    file: File,
    token: string,
    onComplete: (result: RealDocumentResult) => void,
    onStart: () => void,
    onError: (error: string) => void
  ) => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    onStart();

    try {
      setProgress(10);
      
      let extractedText = '';
      let confidence = 0.9;
      let documentType = 'Document';
      let metadata = {
        wordCount: 0,
        language: 'English',
        hasSignatures: false,
        hasFinancialTerms: false,
        pageCount: 1,
      };
      let entities: Array<{ type: string; value: string; confidence: number }> = [];

      // Handle PDF files with our working PDF-to-images-to-text extraction
      if (file.type === 'application/pdf') {
        setProgress(20);
        
        try {
          // Convert PDF to images
          const pdfResult: PDFConversionResult = await convertPDFToImages(file, 20); // Limit to 20 pages for dashboard
          metadata.pageCount = pdfResult.totalPages;
          
          setProgress(40);
          
          // Process each page with Tesseract
          const extractedTexts: string[] = [];
          const confidences: number[] = [];
          
          for (let i = 0; i < pdfResult.images.length; i++) {
            const image = pdfResult.images[i];
            setProgress(40 + (i / pdfResult.images.length) * 40); // 40-80% for OCR processing
            
            try {
              const { data: { text, confidence: pageConfidence } } = await Tesseract.recognize(
                image.image,
                'eng',
                {
                  logger: m => {
                    if (m.status === 'recognizing text') {
                      console.log(`Page ${image.page}: ${Math.round(m.progress * 100)}%`);
                    }
                  }
                }
              );
              
              if (text.trim()) {
                extractedTexts.push(`--- Page ${image.page} ---\n${text.trim()}`);
                confidences.push(pageConfidence);
              }
            } catch (pageError) {
              console.warn(`Error processing page ${image.page}:`, pageError);
              extractedTexts.push(`--- Page ${image.page} ---\n[Error processing this page]`);
              confidences.push(0);
            }
          }
          
          extractedText = extractedTexts.join('\n\n');
          confidence = confidences.length > 0 ? confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length : 0.5;
          documentType = 'PDF Document';
          
        } catch (pdfError) {
          console.error('PDF processing error:', pdfError);
          // Fallback to server processing for PDFs
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/process-document', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Failed to process PDF document');
          }
          
          const result = await response.json();
          extractedText = result.extractedText;
          confidence = result.confidence;
          documentType = result.documentType;
          metadata = result.metadata;
          entities = result.entities;
        }
        
      } else {
        // For non-PDF files, use server processing
        setProgress(30);
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/process-document', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
        
        if (!response.ok) {
          let errorMessage = 'Failed to process document';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (jsonError) {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        
        let result;
        try {
          result = await response.json();
        } catch (jsonError) {
          const responseText = await response.text();
          throw new Error(`Server returned invalid response: ${responseText.substring(0, 200)}...`);
        }
        
        extractedText = result.extractedText;
        confidence = result.confidence;
        documentType = result.documentType;
        metadata = result.metadata;
        entities = result.entities;
      }

      setProgress(90);
      
      // Extract entities if not already extracted
      if (entities.length === 0) {
        entities = extractEntitiesFromText(extractedText);
      }

      setProgress(100);
      
      const documentResult: RealDocumentResult = {
        text: extractedText.trim(),
        confidence,
        entities,
        documentType,
        metadata,
      };

      onComplete(documentResult);
      
    } catch (error) {
      console.error('Real Document Processing Error:', error);
      onError(error instanceof Error ? error.message : 'Document processing failed');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return {
    processFile,
    isProcessing,
    progress,
  };
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


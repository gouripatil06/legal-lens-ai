'use client';

import { useState } from 'react';
import { createWorker } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
}

export function useOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processFile = async (
    file: File,
    onOCRComplete: (result: OCRResult) => void,
    onOCRStart: () => void,
    onOCRError: (error: string) => void
  ) => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    onOCRStart();

    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data: { text, confidence } } = await worker.recognize(file);
      
      await worker.terminate();

      // Extract entities from the text
      const entities = extractEntities(text);

      const result: OCRResult = {
        text: text.trim(),
        confidence: confidence / 100, // Convert to 0-1 scale
        entities,
      };

      onOCRComplete(result);
    } catch (error) {
      console.error('OCR Error:', error);
      onOCRError(error instanceof Error ? error.message : 'OCR processing failed');
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

function extractEntities(text: string): Array<{ type: string; value: string; confidence: number }> {
  const entities: Array<{ type: string; value: string; confidence: number }> = [];
  
  // Extract amounts (₹, $, numbers with currency)
  const amountRegex = /[₹$€£]\s*\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:rupees?|dollars?|euros?|pounds?)/gi;
  const amounts = text.match(amountRegex);
  if (amounts) {
    amounts.forEach(amount => {
      entities.push({ type: 'amount', value: amount.trim(), confidence: 0.9 });
    });
  }
  
  // Extract dates
  const dateRegex = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b|\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b/gi;
  const dates = text.match(dateRegex);
  if (dates) {
    dates.forEach(date => {
      entities.push({ type: 'date', value: date.trim(), confidence: 0.8 });
    });
  }
  
  // Extract emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex);
  if (emails) {
    emails.forEach(email => {
      entities.push({ type: 'email', value: email.trim(), confidence: 0.95 });
    });
  }
  
  // Extract phone numbers
  const phoneRegex = /(?:\+91[-\s]?)?[0-9]{10}|(?:\+91[-\s]?)?[0-9]{5}[-\s]?[0-9]{5}/g;
  const phones = text.match(phoneRegex);
  if (phones) {
    phones.forEach(phone => {
      entities.push({ type: 'phone', value: phone.trim(), confidence: 0.85 });
    });
  }
  
  // Extract legal terms
  const legalTerms = ['agreement', 'contract', 'terms', 'conditions', 'liability', 'warranty', 'indemnity', 'breach', 'termination', 'governing law'];
  legalTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    if (regex.test(text)) {
      entities.push({ type: 'legal_term', value: term, confidence: 0.7 });
    }
  });
  
  return entities;
}

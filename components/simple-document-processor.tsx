'use client';

import { useState } from 'react';

export interface SimpleDocumentResult {
  text: string;
  confidence: number;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
}

export function useSimpleDocumentProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processFile = async (
    file: File,
    onComplete: (result: SimpleDocumentResult) => void,
    onStart: () => void,
    onError: (error: string) => void
  ) => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    onStart();

    try {
      // Simulate processing time
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(50);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate realistic legal document text based on file type
      let extractedText = '';
      let confidence = 0.9;

      if (file.type === 'application/pdf') {
        extractedText = `
LEGAL DOCUMENT ANALYSIS
Document: ${file.name}
Date: ${new Date().toLocaleDateString()}

TERMS AND CONDITIONS AGREEMENT

This agreement is entered into between the parties for the provision of services.

FINANCIAL TERMS:
- Service Fee: ₹25,000 per month
- Setup Fee: ₹5,000 (one-time)
- Payment Terms: Net 30 days
- Late Payment Fee: ₹1,000 per month

CONTRACT DURATION:
- Initial Term: 12 months
- Renewal: Automatic unless terminated
- Termination Notice: 60 days

LIABILITY CLAUSES:
- Limited Liability: Maximum ₹1,00,000
- Indemnification: Mutual indemnification
- Force Majeure: Standard provisions

LEGAL PROVISIONS:
- Governing Law: Indian Contract Act, 1872
- Jurisdiction: Mumbai Courts
- Dispute Resolution: Arbitration

CONTACT INFORMATION:
- Email: legal@company.com
- Phone: +91-9876543210
- Address: 123 Business Park, Mumbai, Maharashtra 400001

SIGNATURE REQUIREMENTS:
- Both parties must sign
- Witness required
- Notarization recommended

RISK ASSESSMENT:
- Financial Risk: Medium
- Legal Risk: Low
- Compliance Risk: Medium
        `;
        confidence = 0.85;
      } else if (file.type.includes('word') || file.type.includes('document')) {
        extractedText = `
CONTRACT AGREEMENT
Document: ${file.name}

SERVICE AGREEMENT TERMS

This document outlines the terms for service provision between the contracting parties.

PAYMENT STRUCTURE:
- Monthly Retainer: ₹15,000
- Additional Services: ₹2,500 per hour
- Expenses: Reimbursable with receipts
- Invoicing: Monthly on 1st

PERFORMANCE STANDARDS:
- Service Level: 99.5% uptime
- Response Time: 4 hours
- Quality Metrics: As per SLA

TERMINATION CONDITIONS:
- Breach of Contract: Immediate
- Non-payment: 15 days notice
- Convenience: 30 days notice

INTELLECTUAL PROPERTY:
- Work Product: Client owns
- Confidentiality: 5 years
- Non-compete: 12 months

LEGAL FRAMEWORK:
- Applicable Law: Indian Contract Act
- Venue: Delhi High Court
- Language: English

CONTACT DETAILS:
- Primary: contracts@firm.com
- Secondary: +91-1234567890
- Emergency: +91-9876543210
        `;
        confidence = 0.9;
      } else {
        // For images or other files
        extractedText = `
DOCUMENT ANALYSIS
File: ${file.name}
Type: ${file.type}

This appears to be a legal document requiring review.

KEY ELEMENTS DETECTED:
- Contractual language present
- Financial terms identified
- Legal clauses recognized
- Signature requirements noted

RECOMMENDED ACTIONS:
1. Review all financial terms
2. Verify legal compliance
3. Check signature requirements
4. Confirm jurisdiction clauses

For detailed analysis, please ensure the document is in PDF or Word format.
        `;
        confidence = 0.7;
      }

      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Extract entities
      const entities = extractEntities(extractedText);

      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 200));

      const result: SimpleDocumentResult = {
        text: extractedText.trim(),
        confidence,
        entities,
      };

      onComplete(result);
    } catch (error) {
      console.error('Processing Error:', error);
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

function extractEntities(text: string): Array<{ type: string; value: string; confidence: number }> {
  const entities: Array<{ type: string; value: string; confidence: number }> = [];
  
  // Extract amounts
  const amountRegex = /[₹$€£]\s*\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:rupees?|dollars?|euros?|pounds?)/gi;
  const amounts = text.match(amountRegex);
  if (amounts) {
    amounts.forEach(amount => {
      entities.push({ type: 'amount', value: amount.trim(), confidence: 0.9 });
    });
  }
  
  // Extract dates
  const dateRegex = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/gi;
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

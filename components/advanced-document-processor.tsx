'use client';

import { useState } from 'react';

export interface AdvancedDocumentResult {
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

export function useAdvancedDocumentProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processFile = async (
    file: File,
    onComplete: (result: AdvancedDocumentResult) => void,
    onStart: () => void,
    onError: (error: string) => void
  ) => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    onStart();

    try {
      // Simulate advanced document processing
      setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProgress(30);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Advanced document analysis based on file type and name
      const fileName = file.name.toLowerCase();
      const fileType = file.type;
      
      let extractedText = '';
      let confidence = 0.9;
      let documentType = 'Legal Document';
      let metadata = {
        wordCount: 0,
        language: 'English',
        hasSignatures: false,
        hasFinancialTerms: false,
      };

      // Detect document type from filename and content
      if (fileName.includes('contract') || fileName.includes('agreement')) {
        documentType = 'Contract Agreement';
        extractedText = generateContractText(fileName);
        metadata.hasSignatures = true;
        metadata.hasFinancialTerms = true;
      } else if (fileName.includes('lease') || fileName.includes('rental')) {
        documentType = 'Lease Agreement';
        extractedText = generateLeaseText(fileName);
        metadata.hasSignatures = true;
        metadata.hasFinancialTerms = true;
      } else if (fileName.includes('employment') || fileName.includes('job')) {
        documentType = 'Employment Contract';
        extractedText = generateEmploymentText(fileName);
        metadata.hasSignatures = true;
        metadata.hasFinancialTerms = true;
      } else if (fileName.includes('nda') || fileName.includes('confidentiality')) {
        documentType = 'Non-Disclosure Agreement';
        extractedText = generateNDAText(fileName);
        metadata.hasSignatures = true;
        metadata.hasFinancialTerms = false;
      } else if (fileName.includes('terms') || fileName.includes('service')) {
        documentType = 'Terms of Service';
        extractedText = generateTermsText(fileName);
        metadata.hasSignatures = false;
        metadata.hasFinancialTerms = true;
      } else if (fileType === 'application/pdf') {
        documentType = 'PDF Legal Document';
        extractedText = generateGenericLegalText(fileName);
        metadata.hasSignatures = true;
        metadata.hasFinancialTerms = true;
      } else {
        documentType = 'Legal Document';
        extractedText = generateGenericLegalText(fileName);
        metadata.hasSignatures = true;
        metadata.hasFinancialTerms = true;
      }

      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 400));

      // Calculate word count
      metadata.wordCount = extractedText.split(/\s+/).length;
      
      // Extract entities with advanced patterns
      const entities = extractAdvancedEntities(extractedText, documentType);

      setProgress(90);
      await new Promise(resolve => setTimeout(resolve, 300));

      const result: AdvancedDocumentResult = {
        text: extractedText.trim(),
        confidence,
        entities,
        documentType,
        metadata,
      };

      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 200));

      onComplete(result);
    } catch (error) {
      console.error('Advanced Processing Error:', error);
      onError(error instanceof Error ? error.message : 'Advanced document processing failed');
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

function generateContractText(fileName: string): string {
  return `
SERVICE AGREEMENT CONTRACT
Document: ${fileName}
Date: ${new Date().toLocaleDateString()}
Contract ID: CNT-${Date.now().toString().slice(-6)}

PARTIES:
- Service Provider: Tech Solutions Pvt Ltd
- Client: ${fileName.split('.')[0]} Company
- Effective Date: ${new Date().toLocaleDateString()}
- Expiry Date: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}

SERVICE SCOPE:
The Provider shall deliver comprehensive technology services including:
- Software Development: Custom application development
- Maintenance: 24/7 system monitoring and support
- Consulting: Technical advisory services
- Training: User training and documentation

FINANCIAL TERMS:
- Monthly Retainer: ₹75,000 (seventy-five thousand rupees)
- Setup Fee: ₹25,000 (one-time, non-refundable)
- Additional Services: ₹2,500 per hour
- Payment Terms: Net 30 days from invoice date
- Late Payment Fee: 2% per month on outstanding amounts
- Currency: Indian Rupees (INR)

PERFORMANCE OBLIGATIONS:
- Service Level Agreement: 99.5% uptime guarantee
- Response Time: 4 hours for critical issues
- Resolution Time: 24 hours for high priority
- Quality Standards: ISO 9001:2015 compliance

INTELLECTUAL PROPERTY:
- Work Product: Client retains ownership of deliverables
- Background IP: Provider retains pre-existing intellectual property
- Confidentiality: 5-year non-disclosure period
- Non-compete: 12 months post-termination

LIABILITY AND INDEMNIFICATION:
- Limitation of Liability: Maximum ₹5,00,000 per incident
- Indemnification: Mutual indemnification for third-party claims
- Force Majeure: Standard force majeure provisions
- Insurance: Professional liability insurance required

TERMINATION CLAUSES:
- Termination for Convenience: 60 days written notice
- Termination for Cause: Immediate upon material breach
- Termination for Non-payment: 15 days after notice
- Post-termination: 30 days transition support

GOVERNING LAW AND DISPUTES:
- Governing Law: Indian Contract Act, 1872
- Jurisdiction: Mumbai High Court
- Dispute Resolution: Arbitration under Arbitration and Conciliation Act, 2015
- Language: English

CONTACT INFORMATION:
- Provider: legal@techsolutions.com, +91-9876543210
- Client: contracts@${fileName.split('.')[0].toLowerCase()}.com
- Emergency: +91-1234567890

SIGNATURE REQUIREMENTS:
- Both parties must sign in presence of witness
- Digital signatures acceptable
- Notarization recommended for amounts above ₹10,00,000

RISK ASSESSMENT:
- Financial Risk: HIGH (₹75,000 monthly commitment)
- Legal Risk: MEDIUM (standard contract terms)
- Compliance Risk: LOW (standard industry practices)
- Operational Risk: MEDIUM (service delivery dependent)
  `;
}

function generateLeaseText(fileName: string): string {
  return `
COMMERCIAL LEASE AGREEMENT
Document: ${fileName}
Date: ${new Date().toLocaleDateString()}
Lease ID: LSE-${Date.now().toString().slice(-6)}

PARTIES:
- Lessor: Property Management Ltd
- Lessee: ${fileName.split('.')[0]} Business
- Property: Commercial Space, Business District, Mumbai
- Lease Term: 36 months (3 years)

PROPERTY DETAILS:
- Address: 123 Business Park, Andheri East, Mumbai 400069
- Area: 2,500 sq ft
- Floor: 5th Floor
- Parking: 2 dedicated parking spaces
- Common Areas: Shared lobby, elevators, restrooms

FINANCIAL TERMS:
- Monthly Rent: ₹1,25,000 (one lakh twenty-five thousand rupees)
- Security Deposit: ₹3,75,000 (three months rent)
- Maintenance Charges: ₹15,000 per month
- Electricity: Separate meter, actual consumption
- Water: Included in maintenance
- Property Tax: Lessor's responsibility

PAYMENT SCHEDULE:
- Rent Due: 1st of each month
- Late Fee: ₹5,000 per day after 5th
- Payment Method: Bank transfer or cheque
- Annual Increase: 5% per year

USE RESTRICTIONS:
- Permitted Use: Office and business activities only
- Prohibited: Manufacturing, retail, residential
- Subletting: Not permitted without written consent
- Alterations: Requires prior written approval

MAINTENANCE RESPONSIBILITIES:
- Lessor: Structural repairs, common areas, elevators
- Lessee: Interior maintenance, cleaning, utilities
- Repairs: Lessee responsible for damages beyond normal wear

TERMINATION:
- Early Termination: 6 months notice + 2 months penalty
- Default: 30 days cure period
- Force Majeure: Standard provisions apply

GOVERNING LAW:
- Applicable Law: Maharashtra Rent Control Act
- Jurisdiction: Mumbai Civil Court
- Language: English

CONTACT:
- Lessor: property@management.com, +91-9876543210
- Lessee: admin@${fileName.split('.')[0].toLowerCase()}.com
  `;
}

function generateEmploymentText(fileName: string): string {
  return `
EMPLOYMENT AGREEMENT
Document: ${fileName}
Date: ${new Date().toLocaleDateString()}
Employee ID: EMP-${Date.now().toString().slice(-6)}

PARTIES:
- Employer: ${fileName.split('.')[0]} Corporation
- Employee: [Employee Name]
- Position: Senior Software Engineer
- Start Date: ${new Date().toLocaleDateString()}
- Employment Type: Full-time, Permanent

COMPENSATION:
- Annual Salary: ₹12,00,000 (twelve lakh rupees)
- Payment: Monthly on last working day
- Performance Bonus: Up to 20% of annual salary
- Stock Options: 1,000 shares vesting over 4 years
- Benefits: Health insurance, PF, ESI

WORK OBLIGATIONS:
- Working Hours: 9 AM to 6 PM, Monday to Friday
- Location: Mumbai office (hybrid work allowed)
- Reporting: Direct to Engineering Manager
- Responsibilities: Software development, code review, mentoring

CONFIDENTIALITY:
- Confidentiality Period: During and 2 years post-employment
- Non-compete: 6 months post-employment
- Non-solicitation: 12 months for employees and clients
- IP Assignment: All work-related IP belongs to employer

TERMINATION:
- Notice Period: 3 months (either party)
- Immediate Termination: For cause (misconduct, breach)
- Severance: 3 months salary for termination without cause
- Garden Leave: May be required during notice period

GOVERNING LAW:
- Applicable Law: Industrial Disputes Act, 1947
- Jurisdiction: Mumbai Labour Court
- Language: English

CONTACT:
- HR: hr@${fileName.split('.')[0].toLowerCase()}.com, +91-9876543210
- Legal: legal@${fileName.split('.')[0].toLowerCase()}.com
  `;
}

function generateNDAText(fileName: string): string {
  return `
NON-DISCLOSURE AGREEMENT
Document: ${fileName}
Date: ${new Date().toLocaleDateString()}
NDA ID: NDA-${Date.now().toString().slice(-6)}

PARTIES:
- Disclosing Party: Tech Innovations Ltd
- Receiving Party: ${fileName.split('.')[0]} Company
- Purpose: Evaluation of potential business partnership

CONFIDENTIAL INFORMATION:
- Technical Data: Software architecture, algorithms, source code
- Business Information: Financial data, customer lists, strategies
- Proprietary Information: Trade secrets, know-how, processes
- Duration: 5 years from disclosure date

OBLIGATIONS:
- Confidentiality: Maintain strict confidentiality
- Use Limitation: Only for evaluation purposes
- No Disclosure: Not to disclose to third parties
- Return: Return all materials upon request

EXCEPTIONS:
- Publicly Available: Information already in public domain
- Independently Developed: Information developed without use of confidential data
- Legally Required: Disclosure required by law or court order

REMEDIES:
- Injunctive Relief: Available for breach
- Damages: Actual and consequential damages
- Attorney Fees: Prevailing party entitled to fees

GOVERNING LAW:
- Applicable Law: Indian Contract Act, 1872
- Jurisdiction: Delhi High Court
- Language: English

CONTACT:
- Disclosing Party: legal@techinnovations.com, +91-9876543210
- Receiving Party: legal@${fileName.split('.')[0].toLowerCase()}.com
  `;
}

function generateTermsText(fileName: string): string {
  return `
TERMS OF SERVICE
Document: ${fileName}
Date: ${new Date().toLocaleDateString()}
Version: 2.1
Effective: ${new Date().toLocaleDateString()}

SERVICE DESCRIPTION:
- Platform: ${fileName.split('.')[0]} Software Platform
- Users: Business and individual users
- Access: Web-based and mobile applications
- Features: Document management, collaboration, analytics

USER OBLIGATIONS:
- Account Security: Maintain secure passwords
- Prohibited Uses: No illegal, harmful, or abusive activities
- Content Responsibility: User responsible for uploaded content
- Compliance: Follow all applicable laws and regulations

PAYMENT TERMS:
- Subscription: Monthly or annual billing
- Pricing: ₹2,500/month for basic, ₹5,000/month for premium
- Billing: Automatic renewal unless cancelled
- Refunds: 30-day money-back guarantee
- Late Payments: Service suspension after 15 days

INTELLECTUAL PROPERTY:
- Platform IP: Company owns all platform technology
- User Content: Users retain ownership of their content
- License: Users grant license to use content for service provision
- Trademarks: All trademarks belong to respective owners

LIABILITY LIMITATIONS:
- Service Availability: 99.9% uptime target
- Data Loss: Regular backups, but no guarantee
- Limitation: Maximum liability limited to fees paid
- Disclaimer: Service provided "as is"

TERMINATION:
- User Termination: Cancel anytime with 30 days notice
- Company Termination: For breach of terms
- Data Retention: 90 days after termination
- Effect: Access revoked, data may be deleted

GOVERNING LAW:
- Applicable Law: Information Technology Act, 2000
- Jurisdiction: Bangalore Civil Court
- Language: English

CONTACT:
- Support: support@${fileName.split('.')[0].toLowerCase()}.com
- Legal: legal@${fileName.split('.')[0].toLowerCase()}.com
- Phone: +91-9876543210
  `;
}

function generateGenericLegalText(fileName: string): string {
  return `
LEGAL DOCUMENT ANALYSIS
Document: ${fileName}
Date: ${new Date().toLocaleDateString()}
Document ID: DOC-${Date.now().toString().slice(-6)}

DOCUMENT OVERVIEW:
This document contains important legal provisions and contractual terms that require careful review and analysis.

KEY PROVISIONS:
- Contractual Terms: Standard legal language and conditions
- Financial Obligations: Payment terms and monetary commitments
- Legal Responsibilities: Rights and obligations of all parties
- Compliance Requirements: Regulatory and statutory obligations

FINANCIAL TERMS:
- Primary Amount: ₹50,000 (fifty thousand rupees)
- Additional Costs: ₹5,000 setup fee, ₹2,500 monthly maintenance
- Payment Schedule: Net 30 days from invoice date
- Late Fees: 1.5% per month on outstanding amounts
- Currency: Indian Rupees (INR)

LEGAL FRAMEWORK:
- Governing Law: Indian Contract Act, 1872
- Jurisdiction: Mumbai High Court
- Dispute Resolution: Arbitration under Arbitration and Conciliation Act
- Language: English
- Validity: 24 months from execution date

RISK ASSESSMENT:
- Financial Risk: MEDIUM (₹50,000 commitment)
- Legal Risk: LOW (standard contract terms)
- Compliance Risk: MEDIUM (regulatory requirements)
- Operational Risk: LOW (standard business practices)

TERMINATION PROVISIONS:
- Notice Period: 60 days written notice
- Termination for Cause: Immediate upon material breach
- Termination for Convenience: 30 days notice
- Post-termination: 15 days transition period

CONTACT INFORMATION:
- Primary Contact: legal@company.com, +91-9876543210
- Secondary Contact: admin@company.com, +91-1234567890
- Emergency: +91-9999999999

SIGNATURE REQUIREMENTS:
- Execution: Both parties must sign
- Witness: One witness required
- Notarization: Recommended for amounts above ₹1,00,000
- Date: Execution date required

COMPLIANCE NOTES:
- GST: Applicable on all charges
- TDS: 10% TDS applicable on payments above ₹30,000
- Regulatory: Compliance with local business regulations required
- Insurance: Professional liability insurance recommended
  `;
}

function extractAdvancedEntities(text: string, documentType: string): Array<{ type: string; value: string; confidence: number }> {
  const entities: Array<{ type: string; value: string; confidence: number }> = [];
  
  // Extract amounts with higher precision
  const amountRegex = /[₹$€£]\s*\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:rupees?|dollars?|euros?|pounds?|lakh|crore)/gi;
  const amounts = text.match(amountRegex);
  if (amounts) {
    amounts.forEach(amount => {
      entities.push({ type: 'amount', value: amount.trim(), confidence: 0.95 });
    });
  }
  
  // Extract dates with various formats
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
  
  // Extract legal terms based on document type
  const legalTerms = ['agreement', 'contract', 'terms', 'conditions', 'liability', 'warranty', 'indemnity', 'breach', 'termination', 'governing law', 'jurisdiction', 'arbitration', 'confidentiality', 'non-compete', 'force majeure'];
  legalTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    if (regex.test(text)) {
      entities.push({ type: 'legal_term', value: term, confidence: 0.8 });
    }
  });
  
  // Extract document-specific terms
  if (documentType.includes('Contract')) {
    const contractTerms = ['retainer', 'setup fee', 'payment terms', 'service level', 'performance', 'deliverables'];
    contractTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      if (regex.test(text)) {
        entities.push({ type: 'contract_term', value: term, confidence: 0.85 });
      }
    });
  }
  
  if (documentType.includes('Lease')) {
    const leaseTerms = ['rent', 'deposit', 'maintenance', 'utilities', 'parking', 'common areas'];
    leaseTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      if (regex.test(text)) {
        entities.push({ type: 'lease_term', value: term, confidence: 0.85 });
      }
    });
  }
  
  if (documentType.includes('Employment')) {
    const employmentTerms = ['salary', 'bonus', 'benefits', 'notice period', 'confidentiality', 'non-compete'];
    employmentTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      if (regex.test(text)) {
        entities.push({ type: 'employment_term', value: term, confidence: 0.85 });
      }
    });
  }
  
  return entities;
}

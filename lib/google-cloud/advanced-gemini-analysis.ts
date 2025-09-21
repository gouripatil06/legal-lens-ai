import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple API key rotation
const API_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY1,
  process.env.GEMINI_API_KEY2,
  process.env.GEMINI_API_KEY3,
].filter(Boolean);

let currentKeyIndex = 0;

function getNextKey(): string {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  console.log(`🔑 Using API key ${currentKeyIndex}/${API_KEYS.length}`);
  return key || '';
}

// Simple retry with key rotation
async function callGeminiWithRetry(prompt: string): Promise<any> {
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    try {
      const genAI = new GoogleGenerativeAI(getNextKey());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return parseGeminiJSON(response.text());
    } catch (error: any) {
      if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
        console.log(`⚠️ Rate limit hit, trying next key...`);
        continue;
      }
      throw error;
    }
  }
  throw new Error('All API keys exhausted');
}

// Helper function to parse JSON from Gemini response
function parseGeminiJSON(text: string): any {
  // Extract JSON from markdown code blocks if present
  let jsonText = text;
  if (text.includes('```json')) {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
  } else if (text.includes('```')) {
    const jsonMatch = text.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
  }
  
  return JSON.parse(jsonText.trim());
}

export interface AdvancedDocumentAnalysis {
  executiveSummary: {
    documentType: string;
    keyPurpose: string;
    partiesInvolved: string[];
    mainSubject: string;
    overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    isLegalDocument: boolean;
    documentCategory: 'legal' | 'contract' | 'academic' | 'business' | 'creative' | 'other';
    analysisWarning?: string;
  };
  
  detailedAnalysis: {
    contractTerms: {
      duration: string;
      paymentTerms: string[];
      obligations: string[];
      terminationClauses: string[];
      penalties: string[];
    };
    
    riskAssessment: {
      financialRisks: Array<{
        type: string;
        description: string;
        impact: 'low' | 'medium' | 'high' | 'critical';
        probability: 'low' | 'medium' | 'high';
        mitigation: string;
        estimatedCost?: string;
      }>;
      
      legalRisks: Array<{
        type: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        clause: string;
        recommendation: string;
      }>;
      
      operationalRisks: Array<{
        type: string;
        description: string;
        impact: 'low' | 'medium' | 'high';
        timeline: string;
        actionRequired: string;
      }>;
    };
    
    complianceCheck: {
      regulatoryRequirements: Array<{
        requirement: string;
        status: 'compliant' | 'non-compliant' | 'unclear';
        description: string;
        actionNeeded?: string;
      }>;
      
      industryStandards: Array<{
        standard: string;
        adherence: 'full' | 'partial' | 'none';
        gaps: string[];
      }>;
    };
    
    financialAnalysis: {
      totalValue: string;
      paymentSchedule: Array<{
        amount: string;
        dueDate: string;
        conditions: string;
      }>;
      
      costBreakdown: Array<{
        category: string;
        amount: string;
        description: string;
      }>;
      
      roiProjection?: {
        timeframe: string;
        expectedReturn: string;
        confidence: number;
      };
    };
  };
  
  humanExplanation: {
    plainLanguageSummary: string;
    keyTakeaways: string[];
    redFlags: string[];
    greenFlags: string[];
    recommendations: Array<{
      priority: 'high' | 'medium' | 'low';
      action: string;
      reason: string;
      timeline: string;
    }>;
    
    nextSteps: Array<{
      step: string;
      description: string;
      responsible: string;
      deadline: string;
    }>;
  };
  
  metadata: {
    analysisDate: string;
    processingTime: number;
    confidence: number;
    wordCount: number;
    complexity: 'simple' | 'moderate' | 'complex' | 'highly-complex';
  };
}

export async function performAdvancedDocumentAnalysis(
  extractedText: string,
  fileName: string
): Promise<AdvancedDocumentAnalysis> {
  const startTime = Date.now();
  
  try {
    // Multiple specialized analysis calls with key rotation
    const [
      executiveSummary,
      contractTerms,
      riskAssessment,
      complianceCheck,
      financialAnalysis,
      humanExplanation
    ] = await Promise.all([
      generateExecutiveSummary(extractedText, fileName),
      analyzeContractTerms(extractedText),
      assessRisks(extractedText),
      checkCompliance(extractedText),
      analyzeFinancials(extractedText),
      generateHumanExplanation(extractedText)
    ]);
    
    const processingTime = Date.now() - startTime;
    
    return {
      executiveSummary,
      detailedAnalysis: {
        contractTerms,
        riskAssessment,
        complianceCheck,
        financialAnalysis
      },
      humanExplanation,
      metadata: {
        analysisDate: new Date().toISOString(),
        processingTime,
        confidence: calculateOverallConfidence(extractedText),
        wordCount: extractedText.split(/\s+/).length,
        complexity: assessComplexity(extractedText)
      }
    };
    
  } catch (error) {
    console.error('Advanced analysis error:', error);
    throw new Error('Failed to perform advanced document analysis');
  }
}

async function generateExecutiveSummary(text: string, fileName: string) {
  const prompt = `
Analyze this document and provide a comprehensive executive summary. First, determine if this is a legal document or contract. If it's NOT a legal document, provide appropriate warnings.

Document: ${fileName}
Content: ${text.substring(0, 8000)}

IMPORTANT: 
1. First determine if this is a legal document, contract, or agreement
2. If it's NOT a legal document (e.g., academic paper, news article, creative content, business report), set isLegalDocument to false and provide a warning
3. If it's a legal document, proceed with normal analysis

Provide ONLY a valid JSON response (no markdown, no explanations, just the JSON object):
{
  "documentType": "specific type of document",
  "keyPurpose": "main purpose in 1-2 sentences",
  "partiesInvolved": ["party1", "party2"],
  "mainSubject": "primary subject matter",
  "overallRiskLevel": "low|medium|high|critical",
  "confidence": 0.95,
  "isLegalDocument": true,
  "documentCategory": "legal|contract|academic|business|creative|other",
  "analysisWarning": "Warning message if not a legal document (optional)"
}
`;

  return await callGeminiWithRetry(prompt);
}

async function analyzeContractTerms(text: string) {
  const prompt = `
Analyze the contract terms in this document. Extract key contractual elements.

Content: ${text.substring(0, 8000)}

Provide ONLY a valid JSON response (no markdown, no explanations, just the JSON object):
{
  "duration": "contract duration",
  "paymentTerms": ["term1", "term2"],
  "obligations": ["obligation1", "obligation2"],
  "terminationClauses": ["clause1", "clause2"],
  "penalties": ["penalty1", "penalty2"]
}
`;

  return await callGeminiWithRetry(prompt);
}

async function assessRisks(text: string) {
  const prompt = `
Perform a comprehensive risk assessment of this document. Identify financial, legal, and operational risks.

Content: ${text.substring(0, 8000)}

Provide ONLY a valid JSON response (no markdown, no explanations, just the JSON object):
{
  "financialRisks": [
    {
      "type": "risk type",
      "description": "detailed description",
      "impact": "low|medium|high|critical",
      "probability": "low|medium|high",
      "mitigation": "mitigation strategy",
      "estimatedCost": "cost if materialized"
    }
  ],
  "legalRisks": [
    {
      "type": "risk type",
      "description": "detailed description",
      "severity": "low|medium|high|critical",
      "clause": "relevant clause",
      "recommendation": "recommended action"
    }
  ],
  "operationalRisks": [
    {
      "type": "risk type",
      "description": "detailed description",
      "impact": "low|medium|high",
      "timeline": "when risk might occur",
      "actionRequired": "required action"
    }
  ]
}
`;

  return await callGeminiWithRetry(prompt);
}

async function checkCompliance(text: string) {
  const prompt = `
Check this document for regulatory compliance and industry standards adherence.

Content: ${text.substring(0, 8000)}

Provide ONLY a valid JSON response (no markdown, no explanations, just the JSON object):
{
  "regulatoryRequirements": [
    {
      "requirement": "specific requirement",
      "status": "compliant|non-compliant|unclear",
      "description": "explanation",
      "actionNeeded": "action if non-compliant"
    }
  ],
  "industryStandards": [
    {
      "standard": "standard name",
      "adherence": "full|partial|none",
      "gaps": ["gap1", "gap2"]
    }
  ]
}
`;

  return await callGeminiWithRetry(prompt);
}

async function analyzeFinancials(text: string) {
  const prompt = `
Analyze the financial aspects of this document. Extract monetary values, payment terms, and financial implications.

Content: ${text.substring(0, 8000)}

Provide ONLY a valid JSON response (no markdown, no explanations, just the JSON object):
{
  "totalValue": "total contract value",
  "paymentSchedule": [
    {
      "amount": "payment amount",
      "dueDate": "due date",
      "conditions": "payment conditions"
    }
  ],
  "costBreakdown": [
    {
      "category": "cost category",
      "amount": "amount",
      "description": "description"
    }
  ],
  "roiProjection": {
    "timeframe": "ROI timeframe",
    "expectedReturn": "expected return",
    "confidence": 0.85
  }
}
`;

  return await callGeminiWithRetry(prompt);
}

async function generateHumanExplanation(text: string) {
  const prompt = `
Provide a human-friendly explanation of this document. Make it accessible to non-legal professionals.

Content: ${text.substring(0, 8000)}

Provide ONLY a valid JSON response (no markdown, no explanations, just the JSON object):
{
  "plainLanguageSummary": "simple explanation in 2-3 paragraphs",
  "keyTakeaways": ["takeaway1", "takeaway2", "takeaway3"],
  "redFlags": ["warning1", "warning2"],
  "greenFlags": ["positive1", "positive2"],
  "recommendations": [
    {
      "priority": "high|medium|low",
      "action": "recommended action",
      "reason": "why this action",
      "timeline": "when to do it"
    }
  ],
  "nextSteps": [
    {
      "step": "step description",
      "description": "detailed description",
      "responsible": "who should do it",
      "deadline": "deadline"
    }
  ]
}
`;

  return await callGeminiWithRetry(prompt);
}

function calculateOverallConfidence(text: string): number {
  // Simple confidence calculation based on text quality
  const wordCount = text.split(/\s+/).length;
  const hasNumbers = /\d/.test(text);
  const hasLegalTerms = /agreement|contract|terms|conditions/i.test(text);
  
  let confidence = 0.7;
  if (wordCount > 500) confidence += 0.1;
  if (hasNumbers) confidence += 0.1;
  if (hasLegalTerms) confidence += 0.1;
  
  return Math.min(confidence, 0.95);
}

function assessComplexity(text: string): 'simple' | 'moderate' | 'complex' | 'highly-complex' {
  const wordCount = text.split(/\s+/).length;
  const legalTermCount = (text.match(/agreement|contract|liability|indemnity|warranty|breach|termination|jurisdiction|arbitration/gi) || []).length;
  
  if (wordCount < 1000 && legalTermCount < 5) return 'simple';
  if (wordCount < 3000 && legalTermCount < 15) return 'moderate';
  if (wordCount < 8000 && legalTermCount < 30) return 'complex';
  return 'highly-complex';
}

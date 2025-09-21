import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface DocumentSummary {
  summary: string;
  keyPoints: string[];
  risks: Array<{
    type: 'financial' | 'legal' | 'time-sensitive' | 'other';
    description: string;
    severity: 'low' | 'medium' | 'high';
    clause: string;
  }>;
  actionItems: string[];
  plainLanguageExplanation: string;
}

export interface ChatResponse {
  answer: string;
  confidence: number;
  relatedClauses: string[];
}

export async function analyzeLegalDocument(
  documentText: string,
  documentType?: string
): Promise<DocumentSummary> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are a legal document analyzer. Analyze the following legal document and provide a comprehensive analysis.

Document Type: ${documentType || 'Unknown'}
Document Text: ${documentText}

Please provide a JSON response with the following structure:
{
  "summary": "A clear, concise summary of the document in plain language",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "risks": [
    {
      "type": "financial|legal|time-sensitive|other",
      "description": "Description of the risk",
      "severity": "low|medium|high",
      "clause": "Relevant clause from the document"
    }
  ],
  "actionItems": ["Action item 1", "Action item 2"],
  "plainLanguageExplanation": "A detailed explanation of the document in simple terms that anyone can understand"
}

Focus on:
1. Identifying potential risks and their severity
2. Explaining complex legal terms in simple language
3. Highlighting important deadlines or obligations
4. Pointing out financial implications
5. Making the document accessible to non-lawyers

Be thorough but concise. Prioritize clarity and practical understanding.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Failed to parse JSON response, using fallback');
    }

    // Fallback if JSON parsing fails
    return {
      summary: text.substring(0, 500) + '...',
      keyPoints: ['Document analysis completed'],
      risks: [],
      actionItems: ['Review the document carefully'],
      plainLanguageExplanation: text,
    };
  } catch (error) {
    console.error('Error analyzing document with Gemini:', error);
    throw new Error(`Failed to analyze document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function chatWithDocument(
  documentText: string,
  question: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<ChatResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const historyContext = chatHistory
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const prompt = `
You are a legal document assistant. You have access to the following legal document and can answer questions about it.

Document Text: ${documentText}

Previous conversation:
${historyContext}

Current Question: ${question}

Please provide a helpful, accurate answer based on the document content. If the question cannot be answered from the document, say so clearly.

Format your response as JSON:
{
  "answer": "Your detailed answer to the question",
  "confidence": 0.95,
  "relatedClauses": ["Relevant clause 1", "Relevant clause 2"]
}

Be specific and cite relevant parts of the document when possible.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Failed to parse JSON response, using fallback');
    }

    // Fallback if JSON parsing fails
    return {
      answer: text,
      confidence: 0.8,
      relatedClauses: [],
    };
  } catch (error) {
    console.error('Error chatting with document:', error);
    throw new Error(`Failed to process chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

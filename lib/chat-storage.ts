/**
 * Chat Storage and Context Management Utilities
 * Handles document chunking, chat history, and context retrieval
 */

export interface DocumentChunk {
  id: string;
  text: string;
  pageNumber?: number;
  sectionType: string;
  confidence: number;
  metadata: {
    startIndex: number;
    endIndex: number;
    wordCount: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  contextChunks?: string[];
  metadata?: {
    responseTime?: number;
    tokensUsed?: number;
  };
}

export interface ChatSession {
  sessionId: string;
  documentId: string;
  documentName: string;
  messages: ChatMessage[];
  context: {
    documentSummary: string;
    keyEntities: string[];
    lastUpdated: string;
  };
}

export interface DocumentContext {
  documentId: string;
  documentName: string;
  fullText: string;
  chunks: DocumentChunk[];
  summary: string | any;
  keyEntities: string[];
  riskFactors: string[];
  createdAt: string;
  lastUpdated: string;
}

/**
 * Split text into semantic chunks for better AI context
 */
export function chunkDocumentText(text: string, documentName: string): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const maxChunkSize = 800; // Optimal size for AI context
  const overlap = 100; // Overlap between chunks for context continuity
  
  // Clean and normalize text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Split by sentences first
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  let chunkIndex = 0;
  let startIndex = 0;
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim() + '.';
    
    // If adding this sentence would exceed chunk size, create a new chunk
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        id: `${documentName}_chunk_${chunkIndex}`,
        text: currentChunk.trim(),
        sectionType: determineSectionType(currentChunk),
        confidence: 0.9,
        metadata: {
          startIndex,
          endIndex: startIndex + currentChunk.length,
          wordCount: currentChunk.split(' ').length
        }
      });
      
      // Start new chunk with overlap
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + ' ' + sentence;
      startIndex += currentChunk.length - overlapText.length - sentence.length;
      chunkIndex++;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  // Add the last chunk if it has content
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: `${documentName}_chunk_${chunkIndex}`,
      text: currentChunk.trim(),
      sectionType: determineSectionType(currentChunk),
      confidence: 0.9,
      metadata: {
        startIndex,
        endIndex: startIndex + currentChunk.length,
        wordCount: currentChunk.split(' ').length
      }
    });
  }
  
  return chunks;
}

/**
 * Determine the type of section based on content
 */
function determineSectionType(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('termination') || lowerText.includes('expire')) {
    return 'termination';
  } else if (lowerText.includes('payment') || lowerText.includes('fee') || lowerText.includes('cost')) {
    return 'payment';
  } else if (lowerText.includes('liability') || lowerText.includes('indemnify')) {
    return 'liability';
  } else if (lowerText.includes('confidential') || lowerText.includes('proprietary')) {
    return 'confidentiality';
  } else if (lowerText.includes('warranty') || lowerText.includes('guarantee')) {
    return 'warranty';
  } else if (lowerText.includes('intellectual property') || lowerText.includes('copyright')) {
    return 'intellectual_property';
  } else if (lowerText.includes('governing law') || lowerText.includes('jurisdiction')) {
    return 'legal';
  } else if (lowerText.includes('force majeure') || lowerText.includes('act of god')) {
    return 'force_majeure';
  } else {
    return 'general';
  }
}

/**
 * Store document context in localStorage
 */
export function storeDocumentContext(documentId: string, context: DocumentContext): void {
  try {
    localStorage.setItem(`document_context_${documentId}`, JSON.stringify(context));
  } catch (error) {
    console.error('Error storing document context:', error);
  }
}

/**
 * Retrieve document context from localStorage
 */
export function getDocumentContext(documentId: string): DocumentContext | null {
  try {
    const stored = localStorage.getItem(`document_context_${documentId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error retrieving document context:', error);
    return null;
  }
}

/**
 * Store chat session in localStorage
 */
export function storeChatSession(session: ChatSession): void {
  try {
    localStorage.setItem(`chat_session_${session.documentId}`, JSON.stringify(session));
  } catch (error) {
    console.error('Error storing chat session:', error);
  }
}

/**
 * Retrieve chat session from localStorage
 */
export function getChatSession(documentId: string): ChatSession | null {
  try {
    const stored = localStorage.getItem(`chat_session_${documentId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error retrieving chat session:', error);
    return null;
  }
}

/**
 * Add message to chat session
 */
export function addMessageToSession(documentId: string, message: ChatMessage): void {
  const session = getChatSession(documentId);
  if (session) {
    session.messages.push(message);
    session.context.lastUpdated = new Date().toISOString();
    storeChatSession(session);
  }
}

/**
 * Create new chat session
 */
export function createChatSession(documentId: string, documentName: string): ChatSession {
  const session: ChatSession = {
    sessionId: `session_${documentId}_${Date.now()}`,
    documentId,
    documentName,
    messages: [],
    context: {
      documentSummary: '',
      keyEntities: [],
      lastUpdated: new Date().toISOString()
    }
  };
  
  storeChatSession(session);
  return session;
}

/**
 * Find relevant chunks for a query
 */
export function findRelevantChunks(query: string, chunks: DocumentChunk[], limit: number = 5): DocumentChunk[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  
  // Score chunks based on keyword matches
  const scoredChunks = chunks.map(chunk => {
    const chunkText = chunk.text.toLowerCase();
    let score = 0;
    
    // Exact phrase matches get highest score
    if (chunkText.includes(query.toLowerCase())) {
      score += 10;
    }
    
    // Individual word matches
    queryWords.forEach(word => {
      const wordCount = (chunkText.match(new RegExp(word, 'g')) || []).length;
      score += wordCount * 2;
    });
    
    // Section type relevance
    const queryLower = query.toLowerCase();
    if (queryLower.includes('termination') && chunk.sectionType === 'termination') {
      score += 5;
    } else if (queryLower.includes('payment') && chunk.sectionType === 'payment') {
      score += 5;
    } else if (queryLower.includes('liability') && chunk.sectionType === 'liability') {
      score += 5;
    }
    
    return { chunk, score };
  });
  
  // Sort by score and return top chunks
  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.chunk);
}

/**
 * Build contextual prompt for AI
 */
export function buildContextualPrompt(
  query: string,
  documentContext: DocumentContext,
  chatHistory: ChatMessage[],
  relevantChunks: DocumentChunk[]
): string {
  const recentHistory = chatHistory.slice(-6); // Last 6 messages
  const historyText = recentHistory
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');
  
  const contextText = relevantChunks
    .map(chunk => `[${chunk.sectionType.toUpperCase()}] ${chunk.text}`)
    .join('\n\n');
  
  return `You are a professional legal AI assistant specializing in document analysis. You're helping with: "${documentContext.documentName}"

DOCUMENT CONTEXT:
${contextText}

CONVERSATION HISTORY:
${historyText}

USER QUESTION: ${query}

CORE INSTRUCTIONS:
1. **Response Style:**
   - Be friendly, professional, and conversational
   - Use clear, accessible language (avoid excessive legal jargon)
   - Keep responses concise but comprehensive
   - Use markdown formatting for better readability

2. **For Greetings/General Questions:**
   - Give warm, brief responses (1-2 sentences)
   - Offer to help with document-specific questions
   - Example: "Hello! I'm here to help you understand this document. What would you like to know?"

3. **For Document Questions:**
   - Provide accurate, specific answers based ONLY on the document content
   - Reference relevant sections when applicable
   - Use bullet points or numbered lists for clarity
   - Include direct quotes from the document when helpful
   - If information is unclear or missing, state this honestly

4. **Response Guidelines:**
   - **Length:** 50-150 words for simple questions, up to 300 words for complex analysis
   - **Accuracy:** Only provide information that's explicitly stated in the document
   - **Clarity:** Break down complex legal concepts into understandable terms
   - **Helpfulness:** Always offer to elaborate or answer follow-up questions

5. **What NOT to do:**
   - Don't make assumptions beyond what's in the document
   - Don't provide legal advice (only analysis of what's written)
   - Don't add information not present in the document
   - Don't give overly long responses unless specifically requested

6. **Markdown Formatting:**
   - Use **bold** for important terms
   - Use bullet points for lists
   - Use \`code blocks\` for specific clauses or terms
   - Use > blockquotes for direct document excerpts

Remember: Your goal is to help the user understand their document better, not to provide legal advice.

Response:`;
}

/**
 * Get all chat sessions for a user
 */
export function getAllChatSessions(): ChatSession[] {
  const sessions: ChatSession[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('chat_session_')) {
      try {
        const session = JSON.parse(localStorage.getItem(key) || '');
        if (session && session.documentId) {
          sessions.push(session);
        }
      } catch (error) {
        console.error('Error parsing chat session:', error);
      }
    }
  }
  
  return sessions.sort((a, b) => 
    new Date(b.context.lastUpdated).getTime() - new Date(a.context.lastUpdated).getTime()
  );
}

/**
 * Delete chat session
 */
export function deleteChatSession(documentId: string): void {
  try {
    localStorage.removeItem(`chat_session_${documentId}`);
  } catch (error) {
    console.error('Error deleting chat session:', error);
  }
}

/**
 * Clear all chat data (for testing or reset)
 */
export function clearAllChatData(): void {
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('chat_session_') || key.startsWith('document_context_'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

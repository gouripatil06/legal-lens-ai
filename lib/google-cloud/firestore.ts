import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIRESTORE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export interface DocumentRecord {
  id: string;
  userId: string;
  fileName: string;
  originalText: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  documentId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  documentId: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Document operations
export async function saveDocument(documentData: Omit<DocumentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await db.collection('documents').add({
      ...documentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving document:', error);
    throw new Error('Failed to save document');
  }
}

export async function getDocument(documentId: string, userId: string): Promise<DocumentRecord | null> {
  try {
    const doc = await db.collection('documents').doc(documentId).get();
    
    if (!doc.exists) {
      return null;
    }

    const data = doc.data() as DocumentRecord;
    
    // Verify user owns the document
    if (data.userId !== userId) {
      throw new Error('Unauthorized access to document');
    }

    return {
      id: doc.id,
      ...data,
    };
  } catch (error) {
    console.error('Error getting document:', error);
    throw new Error('Failed to get document');
  }
}

export async function getUserDocuments(userId: string): Promise<DocumentRecord[]> {
  try {
    const snapshot = await db
      .collection('documents')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as DocumentRecord[];
  } catch (error) {
    console.error('Error getting user documents:', error);
    throw new Error('Failed to get user documents');
  }
}

// Chat operations
export async function saveChatMessage(
  documentId: string,
  userId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<string> {
  try {
    const messageRef = await db.collection('chatMessages').add({
      documentId,
      userId,
      role,
      content,
      timestamp: new Date(),
    });
    return messageRef.id;
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw new Error('Failed to save chat message');
  }
}

export async function getChatHistory(documentId: string, userId: string): Promise<ChatMessage[]> {
  try {
    const snapshot = await db
      .collection('chatMessages')
      .where('documentId', '==', documentId)
      .where('userId', '==', userId)
      .orderBy('timestamp', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatMessage[];
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw new Error('Failed to get chat history');
  }
}

export async function deleteDocument(documentId: string, userId: string): Promise<void> {
  try {
    // Verify user owns the document
    const document = await getDocument(documentId, userId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Delete the document
    await db.collection('documents').doc(documentId).delete();

    // Delete associated chat messages
    const chatSnapshot = await db
      .collection('chatMessages')
      .where('documentId', '==', documentId)
      .get();

    const batch = db.batch();
    chatSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Failed to delete document');
  }
}

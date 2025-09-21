/**
 * Migration utility to add chat functionality to existing documents
 */

import { 
  chunkDocumentText, 
  storeDocumentContext, 
  createChatSession,
  type DocumentContext 
} from './chat-storage';

/**
 * Migrate existing documents to support chat functionality
 */
export function migrateExistingDocuments(): void {
  console.log('🔄 [MIGRATION] Starting migration of existing documents...');
  
  try {
    // Get all existing documents from localStorage
    const existingDocs = JSON.parse(localStorage.getItem('legalLensDocuments') || '[]');
    console.log(`📄 [MIGRATION] Found ${existingDocs.length} existing documents`);
    
    let migratedCount = 0;
    
    existingDocs.forEach((doc: any) => {
      const documentId = doc.id;
      
      // Check if document context already exists
      const existingContext = localStorage.getItem(`document_context_${documentId}`);
      if (existingContext) {
        console.log(`⏭️ [MIGRATION] Document ${documentId} already has chat context, skipping`);
        return;
      }
      
      // Get the individual document data
      const documentData = localStorage.getItem(`document_${documentId}`);
      if (!documentData) {
        console.log(`❌ [MIGRATION] No document data found for ${documentId}, skipping`);
        return;
      }
      
      try {
        const parsedDoc = JSON.parse(documentData);
        console.log(`🔄 [MIGRATION] Migrating document: ${parsedDoc.fileName}`);
        
        // Extract text from OCR result
        const extractedText = parsedDoc.ocrResult?.text || parsedDoc.ocrResult?.originalText || '';
        
        if (!extractedText) {
          console.log(`❌ [MIGRATION] No text found for ${documentId}, skipping`);
          return;
        }
        
        // Create chunks
        const chunks = chunkDocumentText(extractedText, parsedDoc.fileName);
        console.log(`📄 [MIGRATION] Created ${chunks.length} chunks for ${parsedDoc.fileName}`);
        
        // Create document context
        const documentContext: DocumentContext = {
          documentId: documentId,
          documentName: parsedDoc.fileName,
          fullText: extractedText,
          chunks,
          summary: parsedDoc.analysis?.executiveSummary || 'Document analysis completed',
          keyEntities: Array.isArray(parsedDoc.analysis?.keyEntities) 
            ? parsedDoc.analysis.keyEntities 
            : (parsedDoc.analysis?.keyEntities ? [parsedDoc.analysis.keyEntities] : []),
          riskFactors: Array.isArray(parsedDoc.analysis?.riskAssessment?.riskFactors) 
            ? parsedDoc.analysis.riskAssessment.riskFactors 
            : (parsedDoc.analysis?.riskAssessment?.riskFactors ? [parsedDoc.analysis.riskAssessment.riskFactors] : []),
          createdAt: parsedDoc.createdAt || new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        
        // Store document context
        storeDocumentContext(documentId, documentContext);
        console.log(`💾 [MIGRATION] Stored document context for ${parsedDoc.fileName}`);
        
        // Create chat session
        createChatSession(documentId, parsedDoc.fileName);
        console.log(`💬 [MIGRATION] Created chat session for ${parsedDoc.fileName}`);
        
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ [MIGRATION] Error migrating document ${documentId}:`, error);
      }
    });
    
    console.log(`✅ [MIGRATION] Migration completed! Migrated ${migratedCount} documents`);
    
  } catch (error) {
    console.error('❌ [MIGRATION] Error during migration:', error);
  }
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  try {
    const existingDocs = JSON.parse(localStorage.getItem('legalLensDocuments') || '[]');
    
    if (existingDocs.length === 0) {
      return false;
    }
    
    // Check if any document lacks chat context
    return existingDocs.some((doc: any) => {
      const documentId = doc.id;
      const existingContext = localStorage.getItem(`document_context_${documentId}`);
      return !existingContext;
    });
    
  } catch (error) {
    console.error('❌ [MIGRATION] Error checking migration status:', error);
    return false;
  }
}

/**
 * Get migration status
 */
export function getMigrationStatus(): { total: number; migrated: number; needsMigration: boolean } {
  try {
    const existingDocs = JSON.parse(localStorage.getItem('legalLensDocuments') || '[]');
    let migratedCount = 0;
    
    existingDocs.forEach((doc: any) => {
      const documentId = doc.id;
      const existingContext = localStorage.getItem(`document_context_${documentId}`);
      if (existingContext) {
        migratedCount++;
      }
    });
    
    return {
      total: existingDocs.length,
      migrated: migratedCount,
      needsMigration: migratedCount < existingDocs.length
    };
    
  } catch (error) {
    console.error('❌ [MIGRATION] Error getting migration status:', error);
    return { total: 0, migrated: 0, needsMigration: false };
  }
}

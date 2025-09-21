'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Shield,
  DollarSign,
  Users,
  Calendar,
  Target,
  Zap,
  Brain,
  BarChart3,
  PieChart,
  Activity,
  ArrowRight,
  Star,
  AlertCircle,
  Info,
  Lightbulb,
  Timer,
  Award,
  Globe,
  Lock,
  Eye,
  Download,
  Share2,
  BookOpen,
  Scale,
  Gavel,
  Building2,
  CreditCard,
  TrendingDown,
  AlertOctagon
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRealDocumentProcessor, RealDocumentResult } from '@/components/real-document-processor';
import { motion, AnimatePresence } from 'framer-motion';
import { AdvancedDocumentAnalysis } from '@/lib/google-cloud/advanced-gemini-analysis';
import { 
  chunkDocumentText, 
  storeDocumentContext, 
  createChatSession,
  type DocumentContext 
} from '@/lib/chat-storage';

interface Document {
  id: string;
  fileName: string;
  analysis: AdvancedDocumentAnalysis;
  ocrResult: {
    confidence: number;
    originalText: string;
    entities: Array<{ type: string; value: string; confidence: number }>;
  };
  createdAt: Date;
}

export default function Dashboard() {
  const { user } = useUser();
  const { getAccessToken } = useAuth();
  const router = useRouter();
  const { processFile } = useRealDocumentProcessor();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Failed to get access token');
      }

      await processFile(
        file,
        token,
        async (documentResult: RealDocumentResult) => {
          try {
            setUploadProgress(50);
            
            const response = await fetch('/api/upload', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fileName: file.name,
                ocrResult: documentResult,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Analysis failed');
            }

            setUploadProgress(90);
            const result = await response.json();
            
            const documentData = {
              fileName: result.fileName,
              analysis: result.analysis,
              ocrResult: result.ocrResult,
              createdAt: new Date().toISOString(),
            };
            
            // Save individual document
            localStorage.setItem(`document_${result.documentId}`, JSON.stringify(documentData));
            
            // Save to documents list for the documents page
            const documentForList = {
              id: result.documentId,
              name: result.fileName,
              uploadDate: new Date().toISOString(),
              analysisDate: new Date().toISOString(),
              status: 'completed' as const,
              type: result.fileName.toLowerCase().endsWith('.pdf') ? 'pdf' as const : 'image' as const,
              size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              summary: result.analysis?.executiveSummary || 'Document analysis completed',
              riskLevel: result.analysis?.riskAssessment?.overallRisk || 'low' as const,
              extractedText: result.ocrResult?.text,
              analysis: result.analysis
            };
            
            // Get existing documents and add new one
            const existingDocs = JSON.parse(localStorage.getItem('legalLensDocuments') || '[]');
            existingDocs.unshift(documentForList); // Add to beginning
            localStorage.setItem('legalLensDocuments', JSON.stringify(existingDocs));
            
            // Create document context for chat functionality
            const extractedText = result.ocrResult?.text || '';
            if (extractedText) {
              const chunks = chunkDocumentText(extractedText, result.fileName);
              
              const documentContext: DocumentContext = {
                documentId: result.documentId,
                documentName: result.fileName,
                fullText: extractedText,
                chunks,
                summary: result.analysis?.executiveSummary || 'Document analysis completed',
                keyEntities: Array.isArray(result.analysis?.keyEntities) 
                  ? result.analysis.keyEntities 
                  : (result.analysis?.keyEntities ? [result.analysis.keyEntities] : []),
                riskFactors: Array.isArray(result.analysis?.riskAssessment?.riskFactors) 
                  ? result.analysis.riskAssessment.riskFactors 
                  : (result.analysis?.riskAssessment?.riskFactors ? [result.analysis.riskAssessment.riskFactors] : []),
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
              };
              
              
              // Store document context
              storeDocumentContext(result.documentId, documentContext);
              
              // Create chat session
              createChatSession(result.documentId, result.fileName);
            }
            
            setUploadProgress(100);
            await fetchDocuments();
            
            // Small delay to ensure document context is fully stored
            setTimeout(() => {
              router.push(`/documents/${result.documentId}`);
            }, 500);
            
          } catch (error) {
            console.error('Analysis error:', error);
            setError(error instanceof Error ? error.message : 'Analysis failed');
          } finally {
            setIsUploading(false);
            setUploadProgress(0);
          }
        },
        () => setUploadProgress(10),
        (error: string) => {
          setError(error);
          setIsUploading(false);
          setUploadProgress(0);
        }
      );
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const fetchDocuments = async () => {
    try {
      const documents: Document[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('document_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            documents.push({
              id: key.replace('document_', ''),
              fileName: data.fileName,
              analysis: data.analysis,
              ocrResult: data.ocrResult,
              createdAt: new Date(data.createdAt),
            });
          } catch (error) {
            console.error('Error parsing document:', error);
          }
        }
      }
      documents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setDocuments(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/20 dark:border-red-800';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/20 dark:border-orange-800';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950/20 dark:border-yellow-800';
      case 'low': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/20 dark:border-green-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/20 dark:border-gray-800';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertOctagon className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20';
      case 'moderate': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20';
      case 'complex': return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/20';
      case 'highly-complex': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20';
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/20';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Legal AI</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please sign in to access your document analysis dashboard</p>
            <Button onClick={() => router.push('/login')} size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              Sign In
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Legal Document Intelligence
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Advanced AI-powered legal document analysis and risk assessment
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back</p>
                <p className="font-semibold text-gray-900 dark:text-white">{user.firstName || user.emailAddresses[0].emailAddress}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-card border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Documents</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Risk Items</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {documents.reduce((count, doc) => 
                      count + (doc.analysis?.executiveSummary?.overallRiskLevel === 'high' || doc.analysis?.executiveSummary?.overallRiskLevel === 'critical' ? 1 : 0), 0
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Confidence</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {documents.length > 0 ? Math.round(
                      documents.reduce((sum, doc) => sum + (doc.analysis?.metadata?.confidence || 0), 0) / documents.length * 100
                    ) : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Processing Time</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {documents.length > 0 ? Math.round(
                      documents.reduce((sum, doc) => sum + (doc.analysis?.metadata?.processingTime || 0), 0) / documents.length / 1000
                    ) : 0}s
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Timer className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card border shadow-sm mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                Upload Document
              </CardTitle>
              <CardDescription className="text-lg">
                Drag and drop your legal document for advanced AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
                  ${isDragActive 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-105' 
                    : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }
                  ${isUploading ? 'pointer-events-none opacity-50' : ''}
                `}
              >
                <input {...getInputProps()} />
                <AnimatePresence mode="wait">
                  {isUploading ? (
                    <motion.div
                      key="uploading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="space-y-6"
                    >
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                        <Brain className="h-10 w-10 text-primary" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Processing document...</p>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {uploadProgress < 20 ? 'Converting PDF to images...' : 
                           uploadProgress < 80 ? 'Extracting text with OCR...' : 
                           'Analyzing with AI...'}
                        </p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                          <motion.div
                            className="bg-primary h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{uploadProgress}% complete</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="space-y-6"
                    >
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <Upload className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {isDragActive ? 'Drop the file here' : 'Choose a file or drag it here'}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Supports PDF, DOC, DOCX, and image files up to 10MB
                        </p>
                        <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            <span>AI Analysis</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            <span>Risk Assessment</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Brain className="h-4 w-4" />
                            <span>Smart Insights</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Documents List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Your Documents</h2>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {documents.length} documents
            </Badge>
          </div>

          {documents.length === 0 ? (
            <Card className="bg-card border shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">No documents yet</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-8 max-w-md">
                  Upload your first legal document to get started with advanced AI-powered analysis and risk assessment
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Multi-page PDF support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Risk assessment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>AI insights</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="bg-card border shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group hover:bg-accent/50"
                    onClick={() => router.push(`/documents/${doc.id}`)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                              {doc.fileName}
                            </CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {doc.analysis?.executiveSummary?.documentType || 'Document'}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${getRiskColor(doc.analysis?.executiveSummary?.overallRiskLevel || 'low')} border`}>
                          {getRiskIcon(doc.analysis?.executiveSummary?.overallRiskLevel || 'low')}
                          <span className="ml-1 capitalize">{doc.analysis?.executiveSummary?.overallRiskLevel || 'low'}</span>
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Confidence</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {Math.round((doc.analysis?.metadata?.confidence || 0) * 100)}%
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Complexity</span>
                          <Badge className={getComplexityColor(doc.analysis?.metadata?.complexity || 'simple')}>
                            {doc.analysis?.metadata?.complexity || 'simple'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Processing Time</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {Math.round((doc.analysis?.metadata?.processingTime || 0) / 1000)}s
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Insights</p>
                          <div className="space-y-2">
                            {doc.analysis?.humanExplanation?.keyTakeaways?.slice(0, 2).map((takeaway, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">{takeaway}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {doc.analysis?.humanExplanation?.redFlags?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">Red Flags</p>
                            <div className="space-y-1">
                              {doc.analysis.humanExplanation.redFlags.slice(0, 2).map((flag, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <span className="line-clamp-2">{flag}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>{doc.createdAt.toLocaleDateString()}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
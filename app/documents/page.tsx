'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Trash2, 
  Eye, 
  Download,
  Search,
  Filter,
  Plus,
  Brain,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { migrateExistingDocuments, needsMigration } from '@/lib/migrate-existing-documents';

interface Document {
  id: string;
  name: string;
  uploadDate: string;
  analysisDate: string;
  status: 'completed' | 'processing' | 'failed';
  type: 'pdf' | 'image' | 'text';
  size: string;
  summary?: string | any;
  riskLevel?: 'low' | 'medium' | 'high';
  extractedText?: string;
  analysis?: any;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load documents from localStorage
  useEffect(() => {
    const loadDocuments = () => {
      try {
        // Check if migration is needed and run it
        if (needsMigration()) {
          migrateExistingDocuments();
        }
        
        const storedDocuments = localStorage.getItem('legalLensDocuments');
        if (storedDocuments) {
          const parsedDocs = JSON.parse(storedDocuments);
          setDocuments(parsedDocs);
          setFilteredDocuments(parsedDocs);
        }
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, []);

  // Filter documents based on search and status
  useEffect(() => {
    let filtered = documents;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.summary?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(doc => doc.status === filterStatus);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, filterStatus]);

  // Delete document
  const deleteDocument = (documentId: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== documentId);
    setDocuments(updatedDocuments);
    setFilteredDocuments(updatedDocuments);
    
    // Update localStorage - remove from documents list
    localStorage.setItem('legalLensDocuments', JSON.stringify(updatedDocuments));
    
    // Also remove individual document data
    localStorage.removeItem(`document_${documentId}`);
  };

  // View document details
  const viewDocument = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950' };
      case 'processing':
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950' };
      case 'failed':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950' };
      default:
        return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-950' };
    }
  };

  // Get risk level color
  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Documents</h1>
              <p className="text-muted-foreground">
                Manage and review your analyzed legal documents
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => router.push('/dashboard')}
                className="group"
              >
                <Plus className="mr-2 h-4 w-4" />
                Upload New Document
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="text-xs"
              >
                Clear All Data
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter: {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                  All Documents
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('completed')}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('processing')}>
                  Processing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('failed')}>
                  Failed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {searchQuery || filterStatus !== 'all' ? 'No documents found' : 'No documents yet'}
                </h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Upload your first legal document to get started with AI-powered analysis.'
                  }
                </p>
                {!searchQuery && filterStatus === 'all' && (
                  <Button onClick={() => router.push('/dashboard')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredDocuments.map((doc, index) => {
                const StatusIcon = getStatusInfo(doc.status).icon;
                const statusColor = getStatusInfo(doc.status).color;
                const statusBg = getStatusInfo(doc.status).bg;

                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    layout
                  >
                    <Card className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg font-semibold text-foreground truncate">
                                {doc.name}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {doc.type.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {doc.size}
                                </span>
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Filter className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => viewDocument(doc.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteDocument(doc.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Status */}
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", statusBg)} />
                          <StatusIcon className={cn("h-4 w-4", statusColor)} />
                          <span className="text-sm font-medium capitalize">
                            {doc.status}
                          </span>
                        </div>

                        {/* Risk Level */}
                        {doc.riskLevel && (
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-muted-foreground" />
                            <Badge className={cn("text-xs", getRiskColor(doc.riskLevel))}>
                              Risk: {doc.riskLevel}
                            </Badge>
                          </div>
                        )}

                        {/* Summary */}
                        {doc.summary && (
                          <div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {typeof doc.summary === 'string' 
                                ? doc.summary 
                                : (doc.summary.keyPurpose || doc.summary.documentType || 'Document analysis completed')
                              }
                            </p>
                          </div>
                        )}

                        {/* Dates */}
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>Uploaded: {formatDate(doc.uploadDate)}</span>
                          </div>
                          {doc.analysisDate && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>Analyzed: {formatDate(doc.analysisDate)}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => viewDocument(doc.id)}
                          >
                            <Eye className="mr-2 h-3 w-3" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Stats */}
        {documents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">{documents.length}</div>
                  <div className="text-sm text-muted-foreground">Total Documents</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {documents.filter(d => d.status === 'completed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {documents.filter(d => d.status === 'processing').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Processing</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {documents.filter(d => d.status === 'failed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
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
  AlertOctagon,
  Clock, 
  User,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdvancedDocumentAnalysis } from '@/lib/google-cloud/advanced-gemini-analysis';

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

export default function DocumentView() {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']));

  useEffect(() => {
    const fetchDocument = () => {
      try {

        const data = localStorage.getItem(`document_${params.id}`);
        
        if (data) {
          const parsed = JSON.parse(data);
          setDocument({
            id: params.id as string,
            fileName: parsed.fileName,
            analysis: parsed.analysis,
            ocrResult: parsed.ocrResult,
            createdAt: new Date(parsed.createdAt),
          });
        } else {
        }
      } catch (error) {
        console.error('❌ [DOCUMENTS] Error fetching document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [params.id]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/20';
      case 'low': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20';
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Brain className="h-8 w-8 text-white" />
        </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading document analysis...</p>
        </motion.div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Document Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The document you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push('/dashboard')} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
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
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(document.ocrResult.originalText)}
                className="flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </Button>
          <Button
            variant="outline"
                size="sm"
                className="flex items-center gap-2"
          >
                <Download className="h-4 w-4" />
                Export
          </Button>
          <Button
            onClick={() => router.push(`/chat/${document.id}`)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
                <MessageSquare className="h-4 w-4" />
                Chat with AI
          </Button>
            </div>
          </div>

          <div className="bg-card border shadow-sm rounded-2xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
          <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {document.fileName}
            </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {document.analysis?.executiveSummary?.documentType || 'Document Analysis'}
            </p>
          </div>
        </div>

              <div className="flex items-center gap-3">
                <Badge className={`${getRiskColor(document.analysis?.executiveSummary?.overallRiskLevel || 'low')} border text-lg px-4 py-2`}>
                  {getRiskIcon(document.analysis?.executiveSummary?.overallRiskLevel || 'low')}
                  <span className="ml-2 capitalize">{document.analysis?.executiveSummary?.overallRiskLevel || 'low'} Risk</span>
                </Badge>
              </div>
            </div>

            {/* Document Type Warning */}
            {document.analysis?.executiveSummary?.isLegalDocument === false && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                      Non-Legal Document Detected
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      {document.analysis?.executiveSummary?.analysisWarning || 
                        `This appears to be a ${document.analysis?.executiveSummary?.documentCategory || 'non-legal'} document. 
                        Legal Lens AI is specifically designed for legal documents and contracts. 
                        The analysis results may not be accurate or relevant for this type of content.`}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                      💡 For best results, please upload legal contracts, agreements, or other legal documents.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-primary/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">Confidence</p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round((document.analysis?.metadata?.confidence || 0) * 100)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">Word Count</p>
                    <p className="text-2xl font-bold text-foreground">
                      {document.analysis?.metadata?.wordCount?.toLocaleString() || 0}
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">Processing Time</p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round((document.analysis?.metadata?.processingTime || 0) / 1000)}s
                    </p>
                  </div>
                  <Timer className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">Complexity</p>
                    <p className="text-2xl font-bold text-foreground capitalize">
                      {document.analysis?.metadata?.complexity || 'simple'}
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Analysis Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-card border shadow-sm">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="risks" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Risks
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Compliance
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Text
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Executive Summary */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Executive Summary
                    </CardTitle>
              </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Document Purpose</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {document.analysis?.executiveSummary?.keyPurpose || 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Parties Involved</h4>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const parties = document.analysis?.executiveSummary?.partiesInvolved;
                          if (Array.isArray(parties)) {
                            return parties.map((party, idx) => (
                              <Badge key={idx} variant="outline" className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {typeof party === 'string' ? party : String(party)}
                              </Badge>
                            ));
                          } else if (parties && typeof parties === 'object') {
                            return (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Parties information available
                              </Badge>
                            );
                          } else if (typeof parties === 'string') {
                            return (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {parties}
                              </Badge>
                            );
                          } else {
                            return (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Not specified
                              </Badge>
                            );
                          }
                        })()}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Main Subject</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {document.analysis?.executiveSummary?.mainSubject || 'Not specified'}
                      </p>
                    </div>
              </CardContent>
            </Card>

                {/* Contract Terms */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gavel className="h-5 w-5 text-blue-500" />
                      Contract Terms
                    </CardTitle>
              </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Duration</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {document.analysis?.detailedAnalysis?.contractTerms?.duration || 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Terms</h4>
                      <ul className="space-y-1">
                        {Array.isArray(document.analysis?.detailedAnalysis?.contractTerms?.paymentTerms) 
                          ? document.analysis.detailedAnalysis.contractTerms.paymentTerms.slice(0, 3).map((term, idx) => (
                              <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                <ChevronRight className="h-3 w-3 mt-1 flex-shrink-0" />
                                {typeof term === 'string' ? term : String(term)}
                              </li>
                            ))
                          : <li className="text-sm text-gray-600 dark:text-gray-400">No payment terms available</li>
                        }
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Key Obligations</h4>
                      <ul className="space-y-1">
                        {Array.isArray(document.analysis?.detailedAnalysis?.contractTerms?.obligations) 
                          ? document.analysis.detailedAnalysis.contractTerms.obligations.slice(0, 3).map((obligation, idx) => (
                              <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                <Target className="h-3 w-3 mt-1 flex-shrink-0" />
                                {typeof obligation === 'string' ? obligation : String(obligation)}
                    </li>
                            ))
                          : <li className="text-sm text-gray-600 dark:text-gray-400">No obligations available</li>
                        }
                </ul>
                    </div>
              </CardContent>
            </Card>
              </div>

              {/* Human Explanation */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    Human-Friendly Explanation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Plain Language Summary</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {document.analysis?.humanExplanation?.plainLanguageSummary || 'No summary available'}
                    </p>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Green Flags
                      </h4>
                      <ul className="space-y-2">
                        {Array.isArray(document.analysis?.humanExplanation?.greenFlags) 
                          ? document.analysis.humanExplanation.greenFlags.map((flag, idx) => (
                              <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                                {typeof flag === 'string' ? flag : String(flag)}
                              </li>
                            ))
                          : <li className="text-sm text-gray-600 dark:text-gray-400">No green flags identified</li>
                        }
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Red Flags
                      </h4>
                      <ul className="space-y-2">
                        {Array.isArray(document.analysis?.humanExplanation?.redFlags) 
                          ? document.analysis.humanExplanation.redFlags.map((flag, idx) => (
                              <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                <AlertTriangle className="h-3 w-3 mt-1 text-red-500 flex-shrink-0" />
                                {typeof flag === 'string' ? flag : String(flag)}
                              </li>
                            ))
                          : <li className="text-sm text-gray-600 dark:text-gray-400">No red flags identified</li>
                        }
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Risks Tab */}
            <TabsContent value="risks" className="space-y-6">
              <div className="grid gap-6">
                {/* Financial Risks */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      Financial Risks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                      {document.analysis?.detailedAnalysis?.riskAssessment?.financialRisks?.map((risk, idx) => (
                        <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{risk.type}</h4>
                            <div className="flex items-center gap-2">
                              <Badge className={getRiskColor(risk.impact)}>
                                {getRiskIcon(risk.impact)}
                                <span className="ml-1 capitalize">{risk.impact}</span>
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {risk.probability} probability
                          </Badge>
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">{risk.description}</p>
                          {risk.estimatedCost && (
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Estimated Cost: {risk.estimatedCost}
                            </p>
                          )}
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            <strong>Mitigation:</strong> {risk.mitigation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Legal Risks */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scale className="h-5 w-5 text-blue-500" />
                      Legal Risks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {document.analysis?.detailedAnalysis?.riskAssessment?.legalRisks?.map((risk, idx) => (
                        <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{risk.type}</h4>
                            <Badge className={getRiskColor(risk.severity)}>
                              {getRiskIcon(risk.severity)}
                              <span className="ml-1 capitalize">{risk.severity}</span>
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">{risk.description}</p>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <strong>Relevant Clause:</strong> {risk.clause}
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              <strong>Recommendation:</strong> {risk.recommendation}
                            </p>
                          </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

                {/* Operational Risks */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-orange-500" />
                      Operational Risks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                      {document.analysis?.detailedAnalysis?.riskAssessment?.operationalRisks?.map((risk, idx) => (
                        <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{risk.type}</h4>
                            <Badge className={getRiskColor(risk.impact)}>
                              {getRiskIcon(risk.impact)}
                              <span className="ml-1 capitalize">{risk.impact}</span>
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">{risk.description}</p>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <strong>Timeline:</strong> {risk.timeline}
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              <strong>Action Required:</strong> {risk.actionRequired}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Financial Tab */}
            <TabsContent value="financial" className="space-y-6">
              <div className="grid gap-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      Financial Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Total Contract Value</h4>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {document.analysis?.detailedAnalysis?.financialAnalysis?.totalValue || 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Payment Schedule</h4>
                      <div className="space-y-3">
                        {document.analysis?.detailedAnalysis?.financialAnalysis?.paymentSchedule?.map((payment, idx) => (
                          <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-gray-900 dark:text-white">{payment.amount}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{payment.dueDate}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{payment.conditions}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Cost Breakdown</h4>
                      <div className="space-y-3">
                        {document.analysis?.detailedAnalysis?.financialAnalysis?.costBreakdown?.map((cost, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{cost.category}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{cost.description}</p>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">{cost.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance" className="space-y-6">
              <div className="grid gap-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      Compliance Check
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Regulatory Requirements</h4>
                      <div className="space-y-3">
                        {document.analysis?.detailedAnalysis?.complianceCheck?.regulatoryRequirements?.map((req, idx) => (
                          <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-gray-900 dark:text-white">{req.requirement}</h5>
                              <Badge className={
                                req.status === 'compliant' ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20' :
                                req.status === 'non-compliant' ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20' :
                                'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/20'
                              }>
                                {req.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{req.description}</p>
                            {req.actionNeeded && (
                              <p className="text-sm text-blue-600 dark:text-blue-400">
                                <strong>Action Needed:</strong> {req.actionNeeded}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Industry Standards</h4>
                      <div className="space-y-3">
                        {document.analysis?.detailedAnalysis?.complianceCheck?.industryStandards?.map((standard, idx) => (
                          <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-gray-900 dark:text-white">{standard.standard}</h5>
                              <Badge className={
                                standard.adherence === 'full' ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20' :
                                standard.adherence === 'partial' ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/20' :
                                'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20'
                              }>
                                {standard.adherence} adherence
                              </Badge>
                            </div>
                            {standard.gaps.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gaps:</p>
                                <ul className="space-y-1">
                                  {standard.gaps.map((gap, gapIdx) => (
                                    <li key={gapIdx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                      <AlertCircle className="h-3 w-3 mt-1 text-red-500 flex-shrink-0" />
                                      {gap}
                      </li>
                    ))}
                  </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                </CardContent>
              </Card>
              </div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid gap-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Key Insights & Recommendations
                    </CardTitle>
              </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Takeaways</h4>
                      <div className="space-y-2">
                        {document.analysis?.humanExplanation?.keyTakeaways?.map((takeaway, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <Lightbulb className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-gray-700 dark:text-gray-300">{takeaway}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Recommendations</h4>
                      <div className="space-y-3">
                        {document.analysis?.humanExplanation?.recommendations?.map((rec, idx) => (
                          <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-gray-900 dark:text-white">{rec.action}</h5>
                              <Badge className={getPriorityColor(rec.priority)}>
                                {rec.priority} priority
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{rec.reason}</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              <strong>Timeline:</strong> {rec.timeline}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Next Steps</h4>
                      <div className="space-y-3">
                        {document.analysis?.humanExplanation?.nextSteps?.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 dark:text-white mb-1">{step.step}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{step.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {step.responsible}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {step.deadline}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
              </CardContent>
            </Card>
          </div>
            </TabsContent>

            {/* Text Tab */}
            <TabsContent value="text" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    Extracted Text
                  </CardTitle>
                <CardDescription>
                    Raw text extracted from the document with {Math.round(document.ocrResult.confidence * 100)}% confidence
                </CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                      {document.ocrResult.originalText}
                  </pre>
                </div>
                  
                  {document.ocrResult.entities.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Extracted Entities</h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(document.ocrResult.entities) 
                          ? document.ocrResult.entities.map((entity, idx) => (
                              <Badge key={idx} variant="outline" className="flex items-center gap-1">
                                {entity.type === 'amount' && <DollarSign className="h-3 w-3" />}
                                {entity.type === 'date' && <Calendar className="h-3 w-3" />}
                                {entity.type === 'email' && <Mail className="h-3 w-3" />}
                                {entity.type === 'phone' && <Phone className="h-3 w-3" />}
                                {entity.type === 'legal_term' && <Scale className="h-3 w-3" />}
                                <span>{typeof entity.value === 'string' ? entity.value : String(entity.value)}</span>
                                <span className="text-xs opacity-70">({Math.round((entity.confidence || 0) * 100)}%)</span>
                              </Badge>
                            ))
                          : <Badge variant="outline">No entities extracted</Badge>
                        }
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
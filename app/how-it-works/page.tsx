'use client';

import { motion } from 'framer-motion';
import { 
  FileText, 
  Image as ImageIcon, 
  Brain, 
  MessageSquare, 
  Shield, 
  Zap, 
  ArrowRight, 
  CheckCircle,
  Upload,
  Eye,
  BarChart3,
  Users,
  Lock,
  Cloud,
  Cpu,
  Database,
  Globe,
  Search,
  Filter,
  AlertTriangle,
  TrendingUp,
  Clock,
  Target,
  File
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import StackIcon from 'tech-stack-icons';
import Marquee from '@/components/ui/marquee';

export default function HowItWorksPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const steps = [
    {
      id: 1,
      title: "Upload Document",
      description: "Upload your legal document (PDF, image, or text file) through our secure interface.",
      icon: Upload,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      id: 2,
      title: "PDF to Images",
      description: "Convert PDF pages to high-quality images for optimal text extraction.",
      icon: ImageIcon,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      id: 3,
      title: "OCR Processing",
      description: "Extract text from images using advanced Tesseract OCR technology.",
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      id: 4,
      title: "AI Analysis",
      description: "Process text through Google Gemini AI for comprehensive legal analysis.",
      icon: Brain,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    },
    {
      id: 5,
      title: "Smart Chat",
      description: "Ask questions and get contextual answers about your document.",
      icon: MessageSquare,
      color: "text-pink-500",
      bgColor: "bg-pink-50 dark:bg-pink-950"
    }
  ];

  const features = [
    {
      title: "Advanced OCR",
      description: "Tesseract.js for accurate text extraction from any document format",
      icon: Eye,
      color: "text-blue-500"
    },
    {
      title: "AI-Powered Analysis",
      description: "Google Gemini 1.5 Flash for intelligent document understanding",
      icon: Brain,
      color: "text-purple-500"
    },
    {
      title: "Contextual Chat",
      description: "Smart conversation with document context and chat history",
      icon: MessageSquare,
      color: "text-green-500"
    },
    {
      title: "Secure Processing",
      description: "Client-side processing with enterprise-grade security",
      icon: Shield,
      color: "text-red-500"
    },
    {
      title: "Real-time Results",
      description: "Instant analysis with live progress tracking",
      icon: Zap,
      color: "text-yellow-500"
    },
    {
      title: "Multi-format Support",
      description: "PDF, images, and text files with automatic format detection",
      icon: FileText,
      color: "text-indigo-500"
    }
  ];

  const techStack = [
    { name: "Next.js", category: "Framework", iconName: "nextjs2", type: "stack" },
    { name: "React", category: "Frontend", iconName: "react", type: "stack" },
    { name: "TypeScript", category: "Language", iconName: "typescript", type: "stack" },
    { name: "Tailwind CSS", category: "Styling", iconName: "tailwindcss", type: "stack" },
    { name: "Framer Motion", category: "Animation", iconName: "framer", type: "stack" },
    { name: "Tesseract.js", category: "OCR", iconName: "tesseract", type: "custom" },
    { name: "Google Gemini", category: "AI", iconName: "google-gemini-icon", type: "custom" },
    { name: "Clerk", category: "Auth", iconName: "clerk", type: "custom" },
    { name: "PDF.js", category: "PDF Processing", iconName: "pdf", type: "lucide" },
    { name: "Vercel", category: "Deployment", iconName: "vercel", type: "stack" }
  ];

  const analysisTypes = [
    {
      title: "Executive Summary",
      description: "High-level overview of document purpose and key points",
      icon: BarChart3,
      color: "text-blue-500"
    },
    {
      title: "Contract Terms",
      description: "Detailed analysis of terms, conditions, and obligations",
      icon: FileText,
      color: "text-green-500"
    },
    {
      title: "Risk Assessment",
      description: "Identification and evaluation of potential risks",
      icon: AlertTriangle,
      color: "text-red-500"
    },
    {
      title: "Compliance Check",
      description: "Verification against legal standards and regulations",
      icon: CheckCircle,
      color: "text-purple-500"
    },
    {
      title: "Financial Analysis",
      description: "Analysis of payment terms and financial implications",
      icon: TrendingUp,
      color: "text-yellow-500"
    },
    {
      title: "Human Explanation",
      description: "Plain English explanation of complex legal concepts",
      icon: Users,
      color: "text-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How Legal Lens AI Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the powerful technology behind our AI-powered legal document analysis platform
          </p>
        </motion.div>

        {/* Process Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Our 5-Step Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                  className="relative"
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-border hover:border-primary/20">
                    <CardHeader className="text-center pb-3">
                      <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", step.bgColor)}>
                        <Icon className={cn("h-8 w-8", step.color)} />
                      </div>
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {step.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                  
                  {/* Arrow between steps */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <div className="bg-background border border-border rounded-full p-1 shadow-sm">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* System Architecture Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            System Architecture
          </h2>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-muted/30 p-4 border-b">
                <h3 className="text-lg font-semibold text-foreground text-center">
                  Architecture Overview
                </h3>
              </div>
              <div className="p-8">
                <Image
                  src={theme === 'dark' ? '/diagrams/architecture_dark.png' : '/diagrams/architecture_light.png'}
                  alt="System Architecture Diagram"
                  width={1200}
                  height={800}
                  className="w-full h-auto rounded-lg shadow-lg"
                  priority
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Data Flow Process
          </h2>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-muted/30 p-4 border-b">
                <h3 className="text-lg font-semibold text-foreground text-center">
                  Document Processing Flow
                </h3>
              </div>
              <div className="p-8">
                <Image
                  src={theme === 'dark' ? '/diagrams/data_flow_dark.png' : '/diagrams/data_flow_light.png'}
                  alt="Data Flow Process Diagram"
                  width={1200}
                  height={600}
                  className="w-full h-auto rounded-lg shadow-lg"
                  priority
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            User Journey Flow
          </h2>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-muted/30 p-4 border-b">
                <h3 className="text-lg font-semibold text-foreground text-center">
                  Complete User Experience
                </h3>
              </div>
              <div className="p-8">
                <Image
                  src={theme === 'dark' ? '/diagrams/user_flow_dark.png' : '/diagrams/user_flow_light.png'}
                  alt="User Journey Flow Diagram"
                  width={1200}
                  height={600}
                  className="w-full h-auto rounded-lg shadow-lg"
                  priority
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Key Features & Technologies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-border hover:border-primary/20">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-6 w-6", feature.color)} />
                        <CardTitle className="text-lg font-semibold text-foreground">
                          {feature.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Tech Stack Marquee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Technology Stack
          </h2>
          <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-transparent py-10">
            {/* First Row - Frontend & Core Technologies */}
            <Marquee pauseOnHover className="mb-8 select-none [--duration:25s]">
              {[
                { name: 'Next.js', iconName: 'nextjs2', category: 'Framework', type: 'stack' },
                { name: 'React', iconName: 'react', category: 'Frontend', type: 'stack' },
                { name: 'TypeScript', iconName: 'typescript', category: 'Language', type: 'stack' },
                { name: 'Tailwind CSS', iconName: 'tailwindcss', category: 'Styling', type: 'stack' },
                { name: 'Framer Motion', iconName: 'framer', category: 'Animation', type: 'stack' },
                { name: 'Vercel', iconName: 'vercel', category: 'Deployment', type: 'stack' },
              ].map((tech, index) => (
                <div
                  key={`frontend-${index}`}
                  className="relative mx-4 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300 hover:scale-110"
                >
                  <div className="h-12 w-12">
                    {tech.type === "stack" ? (
                      // Use custom light images for dark mode, StackIcon for light mode
                      theme === 'dark' && (tech.name === 'Framer Motion' || tech.name === 'Vercel') ? (
                        <Image
                          src={`/icons/${tech.name === 'Framer Motion' ? 'framer_motion_light' : 'vercel_light'}.png`}
                          alt={tech.name}
                          width={48}
                          height={48}
                          className="h-12 w-12"
                        />
                      ) : (
                        <StackIcon name={tech.iconName} />
                      )
                    ) : tech.type === "custom" ? (
                      <Image
                        src={`/icons/${tech.iconName}.png`}
                        alt={tech.name}
                        width={48}
                        height={48}
                        className={`h-12 w-12 ${tech.name === 'Clerk' ? 'border border-border/30 rounded-lg p-1 bg-background/50' : ''}`}
                      />
                    ) : null}
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold whitespace-nowrap text-foreground mb-2">
                      {tech.name}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className="text-xs font-medium px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                      {tech.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </Marquee>

            {/* Second Row - AI & Specialized Technologies */}
            <Marquee reverse pauseOnHover className="select-none [--duration:30s]">
              {[
                { name: 'Google Gemini', iconName: 'google-gemini-icon', category: 'AI', type: 'custom' },
                { name: 'Tesseract.js', iconName: 'tesseract', category: 'OCR', type: 'custom' },
                { name: 'Clerk', iconName: 'clerk', category: 'Auth', type: 'custom' },
                { name: 'PDF.js', iconName: 'pdf', category: 'PDF Processing', type: 'lucide' },
              ].map((tech, index) => (
                <div
                  key={`ai-specialized-${index}`}
                  className="relative mx-4 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300 hover:scale-110"
                >
                  <div className="h-12 w-12">
                    {tech.type === "custom" ? (
                      <Image
                        src={`/icons/${tech.iconName}.png`}
                        alt={tech.name}
                        width={48}
                        height={48}
                        className={`h-12 w-12 ${tech.name === 'Clerk' ? 'border-2 border-primary/40 rounded-xl p-2 bg-primary/5 shadow-lg' : ''}`}
                      />
                    ) : tech.type === "svg" ? (
                      <Image
                        src={`/icons/${tech.iconName}.svg`}
                        alt={tech.name}
                        width={48}
                        height={48}
                        className="h-12 w-12"
                      />
                    ) : tech.type === "lucide" ? (
                      <File className="h-12 w-12 text-red-500" />
                    ) : null}
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold whitespace-nowrap text-foreground mb-2">
                      {tech.name}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className="text-xs font-medium px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                      {tech.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </Marquee>
          </div>
        </motion.div>

        {/* Analysis Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            AI Analysis Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysisTypes.map((analysis, index) => {
              const Icon = analysis.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-border hover:border-primary/20">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-6 w-6", analysis.color)} />
                        <CardTitle className="text-lg font-semibold text-foreground">
                          {analysis.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {analysis.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>


        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Ready to Experience Legal Lens AI?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Upload your first document and see how our AI-powered analysis can transform your legal document review process.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => router.push('/dashboard')}
                  className="group"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => router.push('/documents')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

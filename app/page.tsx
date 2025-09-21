'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  FileText,
  Brain,
  Scale,
  Eye,
  Target,
  CheckCircle,
  Star,
  Sparkles,
  TrendingUp,
  Lock,
  Award,
  Play,
  Sparkle,
  Hexagon,
  Layers,
  Cpu,
  Database,
  Globe,
  Rocket,
  Lightbulb,
  Code,
  GitBranch,
  Zap as Lightning,
  ChevronRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import RotatingText from "@/components/animations/RotatingText"
import GlitchText from "@/components/animations/GlitchText"
import ScrambledText from "@/components/animations/ScrambledText"
import PixelCard from "@/components/animations/PixelCard"
import { cn } from "@/lib/utils"
import Container from "@/components/Container"
import Wrapper from "@/components/Wrapper"

export default function Home() {
  const router = useRouter()
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  
  const rotatingTexts = [
    "AI-Powered Analysis",
    "Risk Assessment", 
    "Document Intelligence",
    "Legal Insights",
    "Smart Contracts",
    "Compliance Check"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced AI technology analyzes legal documents and extracts key insights",
      color: "from-blue-500 to-cyan-500",
      delay: 0.1
    },
    {
      icon: Scale,
      title: "Risk Assessment",
      description: "Comprehensive risk analysis with detailed mitigation strategies",
      color: "from-purple-500 to-pink-500",
      delay: 0.2
    },
    {
      icon: Eye,
      title: "Document Intelligence",
      description: "Extract insights from contracts, agreements, and legal documents",
      color: "from-green-500 to-emerald-500",
      delay: 0.3
    },
    {
      icon: Shield,
      title: "Secure Processing",
      description: "Secure document processing with privacy protection",
      color: "from-orange-500 to-red-500",
      delay: 0.4
    }
  ]

  const stats = [
    { number: "AI", label: "Powered Analysis", icon: Target, delay: 0.1 },
    { number: "Fast", label: "Processing", icon: Zap, delay: 0.2 },
    { number: "Multi", label: "Document Support", icon: FileText, delay: 0.3 },
    { number: "Smart", label: "Legal Insights", icon: Users, delay: 0.4 }
  ]

  const benefits = [
    {
      icon: TrendingUp,
      title: "Save Time",
      description: "Accelerate document review with AI-powered analysis",
      delay: 0.1
    },
    {
      icon: Award,
      title: "Cut Costs",
      description: "Reduce legal consultation expenses with automated insights",
      delay: 0.2
    },
    {
      icon: CheckCircle,
      title: "Reduce Risk",
      description: "Identify potential legal issues before they become problems",
      delay: 0.3
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share insights and collaborate with your legal team seamlessly",
      delay: 0.4
    }
  ]


  return (
    <div className="min-h-screen bg-background transition-colors duration-300 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Floating Geometric Shapes */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 border-2 border-primary/20 rounded-lg"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-40 right-20 w-16 h-16 border-2 border-primary/20 rounded-full"
          animate={{
            rotate: [360, 0],
            scale: [1, 0.8, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-24 h-24 border-2 border-primary/20"
          style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <Wrapper>
          <div className="absolute inset-0 -z-10 h-[150vh] bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)]" />
          
          <Container>
            <div className="flex h-full flex-col items-center justify-center py-20">
              {/* Animated Badge with RotatingText */}
              <button className="group relative grid overflow-hidden rounded-full px-4 py-1 shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset] transition-colors duration-200">
                <span>
                  <span className="spark mask-gradient animate-flip before:animate-rotate absolute inset-0 h-[100%] w-[100%] overflow-hidden rounded-full [mask:linear-gradient(white,_transparent_50%)] before:absolute before:[inset:0_auto_auto_50%] before:aspect-square before:w-[200%] before:[translate:-50%_-15%] before:rotate-[-90deg] before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-['']" />
                </span>
                <span className="backdrop absolute inset-[1px] rounded-full bg-background/80 backdrop-blur-sm transition-colors duration-200 group-hover:bg-background/90" />
                <span className="from-primary/40 absolute inset-x-0 bottom-0 h-full w-full bg-gradient-to-tr blur-md"></span>
                <span className="z-10 flex items-center justify-center gap-1.5 py-0.5 text-sm text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <RotatingText
                    texts={[
                      'AI-Powered Legal Intelligence',
                      'Document Analysis & Risk Assessment',
                      'Contract Review & Compliance',
                      'Legal Document Processing',
                      'Smart Legal Insights',
                      'Automated Legal Analysis',
                    ]}
                    mainClassName="font-medium"
                    staggerFrom="first"
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    staggerDuration={0.02}
                    splitLevelClassName="overflow-hidden"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    rotationInterval={3000}
                  />
                  <ChevronRight className="h-4 w-4" />
                </span>
              </button>
              
              <div className="mt-8 flex w-11/12 max-w-3xl flex-col items-center md:w-full">
                <div className="mb-6 flex w-full items-center justify-center">
                  <h1 className="mb-2 text-center text-3xl leading-none font-black tracking-tight text-foreground md:text-5xl lg:text-7xl">
                    LegalLens.AI
                  </h1>
                </div>
                <div className="w-full text-center">
                  <ScrambledText
                    radius={80}
                    duration={0.8}
                    speed={0.6}
                    scrambleChars=".:"
                    className="text-foreground/80 m-0 mx-auto mt-6 max-w-4xl text-center text-base md:text-lg"
                    style={{ margin: '1.5rem auto 0', textAlign: 'center' }}
                  >
                    Expert AI technology specializing in legal document analysis, contract review, and risk assessment. 
                    From document upload to actionable insights, we bring intelligence to your legal practice.
                  </ScrambledText>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button 
                  size="lg" 
                  className="group bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg relative overflow-hidden"
                  onClick={() => router.push('/dashboard')}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <Brain className="mr-2 h-5 w-5" />
                  Start Analyzing
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="group border-2 hover:bg-primary/5 px-8 py-4 text-lg relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-primary/5"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="relative mt-8 hidden w-full items-center justify-center md:mt-12 md:flex">
                <div className="border border-foreground/30 shadow-3xl shadow-background/40 flex w-max cursor-pointer items-center justify-center gap-2 rounded-full bg-background/20 px-2 py-1 backdrop-blur-lg select-none md:gap-8 md:py-2">
                  <p className="text-foreground pr-4 pl-4 text-center text-sm font-medium md:text-base lg:pr-0">
                    🚀 {'  '} Ready to transform your legal practice? Let's start analyzing!
                  </p>
                  <Button
                    size="sm"
                    className="border-foreground/20 hidden rounded-full border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 lg:flex"
                    onClick={() => router.push('/dashboard')}
                  >
                    Get Started
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </Wrapper>
      </section>

      {/* AI Features Section with PixelCard Carousel */}
      <section className="py-24 px-4">
        <Container>
          <div className="flex w-full flex-col items-center justify-center py-10 md:py-20">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Powerful AI Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our advanced AI technology revolutionizes how you analyze legal documents
              </p>
            </motion.div>

            {/* AI Features Carousel with PixelCard Animation */}
            <div className="mx-auto w-full max-w-6xl px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: 'AI-Powered Analysis',
                    description: 'Advanced AI technology analyzes legal documents and extracts key insights with intelligent processing.',
                    variant: 'blue',
                  },
                  {
                    title: 'Risk Assessment',
                    description: 'Comprehensive risk analysis with detailed mitigation strategies and severity levels for all potential legal issues.',
                    variant: 'default',
                  },
                  {
                    title: 'Document Intelligence',
                    description: 'Extract insights from contracts, agreements, and legal documents with intelligent entity recognition.',
                    variant: 'yellow',
                  },
                  {
                    title: 'Compliance Check',
                    description: 'Automated compliance verification against industry standards and regulatory requirements with detailed reports.',
                    variant: 'pink',
                  },
                  {
                    title: 'Contract Review',
                    description: 'Intelligent contract analysis with clause identification, term extraction, and potential issue detection.',
                    variant: 'blue',
                  },
                  {
                    title: 'Legal Insights',
                    description: 'Get actionable recommendations and plain-language explanations of complex legal concepts and implications.',
                    variant: 'default',
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="flex justify-center"
                  >
                    <PixelCard
                      variant={feature.variant as 'default' | 'blue' | 'yellow' | 'pink'}
                      className="mx-auto h-[350px] w-full max-w-sm border-border"
                    >
                      <div className="absolute inset-0 flex flex-col justify-center p-6 text-center">
                        <h3 className="mb-4 text-xl font-black text-foreground md:text-2xl lg:text-3xl">
                          {feature.title}
                        </h3>
                        <p className="text-sm leading-relaxed font-medium text-foreground/80 md:text-base">
                          {feature.description}
                        </p>
                      </div>
                    </PixelCard>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-16 px-4 text-center">
              <Button
                size="lg"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 md:px-8 md:text-base"
                onClick={() => router.push('/dashboard')}
              >
                Start AI Analysis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats Section with Counter Animation */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Choose Legal Lens AI
            </h2>
            <p className="text-xl text-muted-foreground">
              Powerful AI technology designed for legal document analysis
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: stat.delay, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center group"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="h-10 w-10 text-primary" />
                </motion.div>
                <motion.div 
                  className="text-4xl md:text-5xl font-bold text-primary mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: stat.delay + 0.3, duration: 0.5 }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
              </div>
      </section>


      {/* Benefits Section */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Choose Legal Lens AI?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transform your legal practice with intelligent document analysis
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: benefit.delay, duration: 0.6 }}
                viewport={{ once: true }}
                className="group"
                whileHover={{ y: -5 }}
              >
                <div className="p-6 rounded-xl border bg-card hover:bg-accent/50 transition-all duration-300 hover:shadow-lg h-full">
                  <motion.div 
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
            </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
          
      {/* Authentication States */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <SignedOut>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="p-12 rounded-3xl border bg-card shadow-xl">
                <div className="text-center space-y-8">
                  <motion.div 
                    className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Users className="h-12 w-12 text-primary" />
                  </motion.div>
                  <div>
                    <h2 className="text-3xl font-bold mb-4 text-foreground">
                      Ready to Get Started?
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      Join thousands of legal professionals who are already using Legal Lens AI 
                      to streamline their document analysis and reduce risk.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        size="lg" 
                        className="group bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg relative overflow-hidden"
                        onClick={() => router.push('/login')}
                      >
                        <motion.div
                          className="absolute inset-0 bg-white/20"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        <Brain className="mr-2 h-5 w-5" />
                        Start Your Free Trial
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    </motion.div>
                    <p className="text-sm text-muted-foreground">
                      No credit card required • 14-day free trial • Cancel anytime
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </SignedOut>

          <SignedIn>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="p-12 rounded-3xl border bg-card shadow-xl">
                <div className="text-center space-y-8">
                  <motion.div 
                    className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <FileText className="h-12 w-12 text-primary" />
                  </motion.div>
                  <div>
                    <h2 className="text-3xl font-bold mb-4 text-foreground">
                      Welcome Back!
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      Ready to analyze your next legal document? Access your dashboard 
                      and continue your AI-powered legal analysis journey.
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="lg" 
                      className="group bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg relative overflow-hidden"
                      onClick={() => router.push('/dashboard')}
                    >
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                      <Brain className="mr-2 h-5 w-5" />
                    Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </SignedIn>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-muted-foreground">
              The brilliant minds behind Legal Lens AI
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Gouri Patil",
                email: "gouripatil2125@gmail.com",
                role: "Lead Developer"
              },
              {
                name: "Ananya Desai", 
                email: "Ananyadudihalli@gmail.com",
                role: "AI Engineer"
              },
              {
                name: "Shreeya Bhasme",
                email: "shreeyabhasme11@gmail.com", 
                role: "Frontend Developer"
              },
              {
                name: "Mahima Kamble",
                email: "Mahimakamble73@gmail.com",
                role: "Backend Developer"
              }
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-border hover:border-primary/20 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <motion.div 
                      className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <span className="text-2xl font-bold text-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </motion.div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {member.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {member.role}
                    </p>
                    <a 
                      href={`mailto:${member.email}`}
                      className="text-sm text-primary hover:text-primary/80 transition-colors break-all"
                    >
                      {member.email}
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
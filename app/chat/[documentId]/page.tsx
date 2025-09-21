'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  FileText, 
  Loader2,
  MessageSquare,
  Brain,
  AlertCircle,
  CheckCircle,
  Clock,
  Sun,
  Moon,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  getDocumentContext, 
  getChatSession, 
  addMessageToSession, 
  findRelevantChunks, 
  buildContextualPrompt,
  type ChatMessage,
  type DocumentContext,
  type ChatSession
} from '@/lib/chat-storage';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { useTheme } from 'next-themes';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const documentId = params.documentId as string;
  
  const [documentContext, setDocumentContext] = useState<DocumentContext | null>(null);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load document context and chat session
  useEffect(() => {
    const loadChatData = () => {
      const context = getDocumentContext(documentId);
      const session = getChatSession(documentId);
      
      if (!context) {
        router.push('/documents');
        return;
      }
      
      setDocumentContext(context);
      setChatSession(session);
      setMessages(session?.messages || []);
      
      // Auto-scroll to bottom when chat loads
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };

    loadChatData();
  }, [documentId, router]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingMessage]);

  // Typing effect function - letter by letter for smooth effect
  const typeMessage = (text: string, onComplete: () => void) => {
    setTypingMessage('');
    let index = 0;
    
    const typeNextLetter = () => {
      if (index < text.length) {
        setTypingMessage(prev => prev + text[index]);
        index++;
        // Faster typing for letters: 20-50ms per letter
        setTimeout(typeNextLetter, 20 + Math.random() * 30);
      } else {
        // Just complete without adding to messages - keep the typing message as final
        onComplete();
      }
    };
    
    typeNextLetter();
  };

  // Handle textarea resize and Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle textarea auto-resize
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  // Send message to AI
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !documentContext || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    addMessageToSession(documentId, userMessage);
    setInputMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsLoading(true);
    setIsTyping(true);

    try {
      // Find relevant chunks
      const relevantChunks = findRelevantChunks(inputMessage, documentContext.chunks, 5);
      
      // Build contextual prompt
      const prompt = buildContextualPrompt(
        inputMessage,
        documentContext,
        messages,
        relevantChunks
      );

      // Call Gemini API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          documentId,
          contextChunks: relevantChunks.map(chunk => chunk.id)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      // Start typing effect
      setIsTyping(true);
      typeMessage(data.response, () => {
        // Typing complete, save the message and keep the typed text visible
        const aiMessage: ChatMessage = {
          id: `msg_${Date.now()}_ai`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
          contextChunks: relevantChunks.map(chunk => chunk.id),
          metadata: {
            responseTime: data.responseTime,
            tokensUsed: data.tokensUsed
          }
        };

        // Add to messages and save to session
        setMessages(prev => [...prev, aiMessage]);
        addMessageToSession(documentId, aiMessage);
        
        // Keep the typing message visible, just remove the cursor and typing state
        setTimeout(() => {
          setIsTyping(false);
          // Don't clear typingMessage - keep the text visible
        }, 300); // Shorter delay to remove cursor
      });

    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorText = 'Sorry, I encountered an error while processing your request. Please try again.';
      
      // Start typing effect for error message
      setIsTyping(true);
      typeMessage(errorText, () => {
        const errorMessage: ChatMessage = {
          id: `msg_${Date.now()}_error`,
          role: 'assistant',
          content: errorText,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, errorMessage]);
        addMessageToSession(documentId, errorMessage);
        
        // Keep the typing message visible, just remove the cursor and typing state
        setTimeout(() => {
          setIsTyping(false);
          // Don't clear typingMessage - keep the text visible
        }, 300);
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!documentContext) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Add error boundary for rendering
  try {
    console.log('🎨 [CHAT] Rendering chat page with context:', documentContext);
    console.log('🔍 [CHAT] About to render keyEntities:', documentContext.keyEntities);
    console.log('🔍 [CHAT] About to render riskFactors:', documentContext.riskFactors);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="font-semibold text-foreground">{documentContext.documentName}</h1>
                  <p className="text-sm text-muted-foreground">AI Chat Assistant</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                AI Powered
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8 p-0"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Type Warning */}
      {documentContext.summary && typeof documentContext.summary === 'object' && documentContext.summary.isLegalDocument === false && (
        <div className="border-b bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Non-Legal Document:</strong> This appears to be a {documentContext.summary.documentCategory || 'non-legal'} document. 
                  AI responses may not be accurate for non-legal content.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Start a conversation
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Ask me anything about this document. I can help you understand terms, 
                    find specific clauses, analyze risks, and more.
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={cn(
                        "flex gap-3",
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      
                      <div className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        message.role === 'user' 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-foreground"
                      )}>
                        <div className="text-sm leading-relaxed">
                          {message.role === 'assistant' ? (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <ReactMarkdown 
                                components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4">{children}</ul>,
                                ol: ({ children }) => <ol className="mb-2 last:mb-0 pl-4">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                code: ({ children }) => <code className="bg-muted-foreground/20 px-1 py-0.5 rounded text-xs">{children}</code>,
                                pre: ({ children }) => <pre className="bg-muted-foreground/20 p-2 rounded text-xs overflow-x-auto">{children}</pre>,
                              }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                          ) : (
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          )}
                        </div>
                        
                        {message.contextChunks && message.contextChunks.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CheckCircle className="h-3 w-3" />
                              <span>Based on document sections</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-2 text-xs text-muted-foreground/70">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      {message.role === 'user' && (
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                          {user?.imageUrl ? (
                            <img 
                              src={user.imageUrl} 
                              alt="User" 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3 max-w-[80%]">
                    <div className="text-sm leading-relaxed">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown 
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4">{children}</ul>,
                            ol: ({ children }) => <ol className="mb-2 last:mb-0 pl-4">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            code: ({ children }) => <code className="bg-muted-foreground/20 px-1 py-0.5 rounded text-xs">{children}</code>,
                            pre: ({ children }) => <pre className="bg-muted-foreground/20 p-2 rounded text-xs overflow-x-auto">{children}</pre>,
                          }}
                        >
                          {typingMessage}
                        </ReactMarkdown>
                      </div>
                      {typingMessage && (
                        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1"></span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Textarea
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={handleTextareaChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask me anything about this document... (Shift+Enter for new line)"
                      className="min-h-[44px] max-h-[120px] resize-none border-border focus:border-primary"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    size="lg"
                    className="h-11 px-6"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('❌ [CHAT] Error rendering chat page:', error);
    console.error('❌ [CHAT] Error details:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Chat Error</h2>
          <p className="text-muted-foreground mb-4">There was an error loading the chat interface.</p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }
}

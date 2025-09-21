import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Simple API key rotation for chat
const API_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY1,
  process.env.GEMINI_API_KEY2,
  process.env.GEMINI_API_KEY3,
].filter(Boolean);

let currentKeyIndex = 0;

function getNextKey(): string {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  console.log(`🔑 Chat using API key ${currentKeyIndex}/${API_KEYS.length}`);
  return key || '';
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, documentId, contextChunks } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const startTime = Date.now();

    // Try with key rotation
    let text = '';
    let response: any;
    
    for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
      try {
        const genAI = new GoogleGenerativeAI(getNextKey());
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        });

        const result = await model.generateContent(prompt);
        response = await result.response;
        text = response.text();
        break; // Success, exit the retry loop
      } catch (error: any) {
        if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
          console.log(`⚠️ Chat rate limit hit, trying next key...`);
          continue;
        }
        throw error; // Re-throw if it's not a rate limit error
      }
    }
    
    if (!text) {
      throw new Error('All API keys exhausted for chat');
    }

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Extract token usage if available
    const usageMetadata = response.usageMetadata;
    const tokensUsed = usageMetadata?.totalTokenCount || 0;

    return NextResponse.json({
      response: text,
      responseTime,
      tokensUsed,
      documentId,
      contextChunks,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
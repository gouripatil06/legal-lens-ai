import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// Check which AI provider to use
const USE_OPENAI = process.env.USE_OPEN_AI === 'true' || process.env.USE_OPENAI === 'true';

// OpenAI setup (single API key)
let openaiClient: OpenAI | null = null;
if (USE_OPENAI) {
  if (!process.env.OPEN_AI_API_KEY) {
    console.warn('⚠️ OPEN_AI_API_KEY not found, but USE_OPEN_AI is true');
  } else {
    openaiClient = new OpenAI({
      apiKey: process.env.OPEN_AI_API_KEY,
    });
    console.log('🤖 Using OpenAI (GPT-4o Mini) for chat');
  }
}

// Gemini setup (multiple API keys for rotation)
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
  console.log(`🔑 Chat using Gemini API key ${currentKeyIndex}/${API_KEYS.length}`);
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

    // Check API key configuration
    if (USE_OPENAI) {
      if (!process.env.OPEN_AI_API_KEY) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 500 }
        );
      }
    } else {
      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
          { error: 'Gemini API key not configured' },
          { status: 500 }
        );
      }
    }

    const startTime = Date.now();

    let text = '';
    let tokensUsed = 0;

    if (USE_OPENAI && openaiClient) {
      // Use OpenAI
      try {
        console.log('🤖 Calling OpenAI GPT-4o Mini for chat...');
        const response = await openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        });

        text = response.choices[0]?.message?.content || '';
        tokensUsed = (response.usage?.prompt_tokens || 0) + (response.usage?.completion_tokens || 0);
      } catch (error: any) {
        console.error('OpenAI chat error:', error);
        throw new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
      }
    } else {
      // Use Gemini with key rotation
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

      // Extract token usage if available
      const usageMetadata = response.usageMetadata;
      tokensUsed = usageMetadata?.totalTokenCount || 0;
    }

    const endTime = Date.now();
    const responseTime = endTime - startTime;

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
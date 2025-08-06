import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

export default openai;

// Text completion
export async function generateText(
  prompt: string,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    systemMessage?: string;
  }
) {
  try {
    const completion = await openai.chat.completions.create({
      model: options?.model || 'gpt-3.5-turbo',
      messages: [
        ...(options?.systemMessage 
          ? [{ role: 'system' as const, content: options.systemMessage }] 
          : []
        ),
        { role: 'user' as const, content: prompt },
      ],
      max_tokens: options?.maxTokens || 500,
      temperature: options?.temperature || 0.7,
    });

    return {
      success: true,
      text: completion.choices[0]?.message?.content || '',
      usage: completion.usage,
    };
  } catch (error) {
    console.error('OpenAI completion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate text',
      text: '',
    };
  }
}

// Stream text completion
export async function streamText(
  prompt: string,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    systemMessage?: string;
  }
) {
  try {
    const stream = await openai.chat.completions.create({
      model: options?.model || 'gpt-3.5-turbo',
      messages: [
        ...(options?.systemMessage 
          ? [{ role: 'system' as const, content: options.systemMessage }] 
          : []
        ),
        { role: 'user' as const, content: prompt },
      ],
      max_tokens: options?.maxTokens || 500,
      temperature: options?.temperature || 0.7,
      stream: true,
    });

    return {
      success: true,
      stream,
    };
  } catch (error) {
    console.error('OpenAI streaming error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to stream text',
      stream: null,
    };
  }
}

// Generate embeddings
export async function generateEmbedding(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return {
      success: true,
      embedding: response.data[0].embedding,
      usage: response.usage,
    };
  } catch (error) {
    console.error('OpenAI embedding error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate embedding',
      embedding: [],
    };
  }
}

// Moderate content
export async function moderateContent(text: string) {
  try {
    const response = await openai.moderations.create({
      input: text,
    });

    const result = response.results[0];
    
    return {
      success: true,
      flagged: result.flagged,
      categories: result.categories,
      scores: result.category_scores,
    };
  } catch (error) {
    console.error('OpenAI moderation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to moderate content',
      flagged: false,
      categories: {},
      scores: {},
    };
  }
}

// Generate image
export async function generateImage(
  prompt: string,
  options?: {
    size?: '256x256' | '512x512' | '1024x1024';
    n?: number;
    quality?: 'standard' | 'hd';
    style?: 'natural' | 'vivid';
  }
) {
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      size: options?.size || '1024x1024',
      n: options?.n || 1,
      quality: options?.quality || 'standard',
      style: options?.style || 'vivid',
    });

    return {
      success: true,
      images: response.data.map(img => img.url),
    };
  } catch (error) {
    console.error('OpenAI image generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate image',
      images: [],
    };
  }
}

// Transcribe audio
export async function transcribeAudio(
  audioFile: File,
  options?: {
    language?: string;
    prompt?: string;
  }
) {
  try {
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: options?.language,
      prompt: options?.prompt,
    });

    return {
      success: true,
      text: response.text,
    };
  } catch (error) {
    console.error('OpenAI transcription error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to transcribe audio',
      text: '',
    };
  }
}

// Text to speech
export async function textToSpeech(
  text: string,
  options?: {
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    model?: 'tts-1' | 'tts-1-hd';
    speed?: number;
  }
) {
  try {
    const response = await openai.audio.speech.create({
      model: options?.model || 'tts-1',
      voice: options?.voice || 'alloy',
      input: text,
      speed: options?.speed || 1.0,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    
    return {
      success: true,
      audio: buffer,
    };
  } catch (error) {
    console.error('OpenAI TTS error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate speech',
      audio: null,
    };
  }
}
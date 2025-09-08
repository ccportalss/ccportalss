import OpenAI from 'openai';

export class OpenAIService {
  private client: OpenAI;
  
  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Only for demo - use backend in production
    });
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('OpenAI embedding error:', error);
      throw new Error('Failed to create embedding');
    }
  }

  async createEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      // Process in batches to avoid rate limits
      const batchSize = 100;
      const embeddings: number[][] = [];
      
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        
        const response = await this.client.embeddings.create({
          model: 'text-embedding-3-small',
          input: batch,
        });
        
        const batchEmbeddings = response.data.map(item => item.embedding);
        embeddings.push(...batchEmbeddings);
        
        // Add small delay between batches
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      return embeddings;
    } catch (error) {
      console.error('OpenAI batch embedding error:', error);
      throw new Error('Failed to create embeddings');
    }
  }

  async generateResponse(
    query: string, 
    context: string, 
    onStream?: (chunk: string) => void
  ): Promise<string> {
    try {
      const systemPrompt = `당신은 업로드된 PDF 문서를 바탕으로 질문에 답하는 AI 어시스턴트입니다.

규칙:
1. 제공된 문서 내용만을 바탕으로 답변하세요
2. 문서에 없는 내용은 추측하지 마세요
3. 답변은 한국어로, 정확하고 도움이 되도록 작성하세요
4. 출처가 불분명한 경우 그렇다고 명시하세요

문서 내용:
${context}`;

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: query }
      ];

      if (onStream) {
        // Streaming response
        const stream = await this.client.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: true,
        });

        let fullResponse = '';
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            onStream(content);
          }
        }
        return fullResponse;
      } else {
        // Non-streaming response
        const response = await this.client.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
        });

        return response.choices[0].message.content || '';
      }
    } catch (error) {
      console.error('OpenAI chat error:', error);
      throw new Error('Failed to generate response');
    }
  }
}
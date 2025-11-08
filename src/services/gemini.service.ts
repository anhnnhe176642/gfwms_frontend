import api from '@/lib/api';

export type GeminiPromptRequest = {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

export type GeminiPromptResponse = {
  message: string;
  data: {
    text: string;
    model: string;
    usage: {
      promptTokens: number;
      outputTokens: number;
      totalTokens: number;
    };
  };
};

const BASE_PATH = '/v1/gemini';

export const geminiService = {
  /**
   * Gọi Gemini API để xử lý prompt
   */
  prompt: async (data: GeminiPromptRequest): Promise<GeminiPromptResponse> => {
    const response = await api.post<GeminiPromptResponse>(`${BASE_PATH}/prompt`, data);
    return response.data;
  },
};

export default geminiService;

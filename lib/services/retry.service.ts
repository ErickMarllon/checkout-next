interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

/**
 * Executa uma função com retry logic usando backoff exponencial
 * @param fn - Função assíncrona a ser executada
 * @param config - Configuração de retry
 * @returns Promise com resultado da operação
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<RetryResult<T>> {
  const {
    maxRetries = 3,
    initialDelay = 1000, // 1 segundo
    maxDelay = 30000, // 30 segundos
    backoffMultiplier = 2,
  } = config;

  let lastError: Error | undefined;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const data = await fn();
      return {
        success: true,
        data,
        attempts: attempt,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Não fazer retry se for erro de validação ou autenticação
      if (lastError.message.includes('400') || 
          lastError.message.includes('401') || 
          lastError.message.includes('403')) {
        return {
          success: false,
          error: lastError,
          attempts: attempt,
        };
      }

      if (attempt <= maxRetries) {
        console.warn(
          `⚠️ Attempt ${attempt}/${maxRetries + 1} failed. Retrying in ${delay}ms...`,
          lastError.message
        );
        
        await sleep(delay);
        
        // Backoff exponencial com teto máximo
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: maxRetries + 1,
  };
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Executa uma requisição HTTP com retry para chamadas à API externa
 * @param url - URL da API
 * @param options - Opções do fetch
 * @param config - Configuração de retry
 * @returns Response da requisição
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  config: RetryConfig = {}
): Promise<Response> {
  const result = await executeWithRetry<Response>(
    async () => {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    },
    config
  );

  if (!result.success || !result.data) {
    throw result.error || new Error('Request failed after all retries');
  }

  return result.data;
}

/**
 * Classe utilitária para operações com retry em APIs de pagamento
 */
export class PaymentGatewayClient {
  private baseUrl: string;
  private apiKey: string;
  private defaultRetryConfig: RetryConfig;

  constructor(
    baseUrl: string,
    apiKey: string,
    retryConfig?: RetryConfig
  ) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.defaultRetryConfig = retryConfig ?? {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
    };
  }

  /**
   * Faz uma requisição POST com retry automático
   */
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const result = await executeWithRetry<T>(
      async () => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorBody = await response.text().catch(() => 'Unknown error');
          throw new Error(`API Error ${response.status}: ${errorBody}`);
        }

        return response.json() as Promise<T>;
      },
      this.defaultRetryConfig
    );

    if (!result.success || result.data === undefined) {
      throw result.error || new Error('Request failed after all retries');
    }

    return result.data;
  }

  /**
   * Faz uma requisição GET com retry automático
   */
  async get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const result = await executeWithRetry<T>(
      async () => {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        });

        if (!response.ok) {
          throw new Error(`API Error ${response.status}`);
        }

        return response.json() as Promise<T>;
      },
      this.defaultRetryConfig
    );

    if (!result.success || result.data === undefined) {
      throw result.error || new Error('Request failed after all retries');
    }

    return result.data;
  }
}

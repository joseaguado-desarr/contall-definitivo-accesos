const API_URL = import.meta.env.VITE_API_URL || '/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  [key: string]: any;
}

export const apiClient = {
  async request(endpoint: string, options: RequestOptions = {}) {
    const token = localStorage.getItem('auth_token');
    
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
      });

      // Handle 204 No Content
      if (response.status === 204) return null;

      // Parse response body
      let responseData: any = null;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Handle errors
      if (!response.ok) {
        const errorMessage = 
          (typeof responseData === 'object' && (responseData.error || responseData.message)) ||
          (typeof responseData === 'string' && responseData) ||
          `HTTP ${response.status}: ${response.statusText}`;
        
        console.error(`API Error [${response.status}]:`, errorMessage);
        throw new Error(errorMessage);
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint: string, body: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put(endpoint: string, body: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

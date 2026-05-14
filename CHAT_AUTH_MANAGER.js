/**
 * Gerenciador de autenticação simples para Chat
 * Sem login - apenas um token por dispositivo
 */

class ChatAuthManager {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
    this.tokenKey = 'chatToken';
    this.deviceIdKey = 'deviceId';
    
    // Inicializar automaticamente ao criar a instância
    this.init();
  }

  /**
   * Inicializa - cria ou retorna token existente
   */
  async init() {
    const deviceId = this.getOrCreateDeviceId();
    
    // Se já tem token, não precisa fazer nada
    if (this.hasValidToken()) {
      return;
    }
    
    // Obter token do servidor
    await this.initChat();
  }

  /**
   * Gera ou retorna Device ID
   */
  getOrCreateDeviceId() {
    let deviceId = localStorage.getItem(this.deviceIdKey);

    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(this.deviceIdKey, deviceId);
    }

    return deviceId;
  }

  /**
   * Verifica se tem token válido
   */
  hasValidToken() {
    return !!localStorage.getItem(this.tokenKey);
  }

  /**
   * Inicializa chat - cria usuário anônimo e retorna token
   */
  async initChat() {
    try {
      const deviceId = this.getOrCreateDeviceId();
      
      const response = await fetch(`${this.apiBaseUrl}/init-chat?deviceId=${encodeURIComponent(deviceId)}`, {
        method: 'GET'
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Erro ao inicializar chat');
      }

      // Armazenar token
      localStorage.setItem(this.tokenKey, data.token);

      return {
        success: true,
        token: data.token,
        user: data.user
      };
    } catch (error) {
      console.error('Erro ao inicializar chat:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Faz uma requisição autenticada
   */
  async authenticatedFetch(url, options = {}) {
    try {
      const token = localStorage.getItem(this.tokenKey);

      if (!token) {
        throw new Error('Token não encontrado. Execute init() primeiro.');
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        }
      });

      // Se receber 401, limpa o token
      if (response.status === 401) {
        localStorage.removeItem(this.tokenKey);
        throw new Error('Autenticação inválida');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro em requisição autenticada:', error);
      throw error;
    }
  }

  // ===== CHATS =====
  
  async getChats() {
    return this.authenticatedFetch(`${this.apiBaseUrl}/chats`);
  }

  async getChat(chatId) {
    return this.authenticatedFetch(`${this.apiBaseUrl}/chat?id=${chatId}`);
  }

  async createChat(participantIds) {
    return this.authenticatedFetch(`${this.apiBaseUrl}/criar-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        participantIds: Array.isArray(participantIds) ? participantIds : [participantIds]
      })
    });
  }

  // ===== MENSAGENS =====

  async getMessages(chatId) {
    return this.authenticatedFetch(`${this.apiBaseUrl}/mensagens?chatId=${chatId}`);
  }

  async createMessage(chatId, text, sentTo) {
    return this.authenticatedFetch(`${this.apiBaseUrl}/criar-mensagem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_chat: chatId,
        text,
        sentTo
      })
    });
  }

  async markMessagesAsSeen(chatId) {
    return this.authenticatedFetch(`${this.apiBaseUrl}/chat/${chatId}/atualizar-status-visto`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        seen: true
      })
    });
  }

  // ===== USUÁRIOS =====

  async getUserInfo(userId) {
    return this.authenticatedFetch(`${this.apiBaseUrl}/usuario/${userId}`);
  }

  async getAllUsers() {
    return this.authenticatedFetch(`${this.apiBaseUrl}/usuarios`);
  }

  async updateUser(userId, data) {
    return this.authenticatedFetch(`${this.apiBaseUrl}/atualizar-usuario/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  }

  // ===== UTILIDADES =====

  /**
   * Limpa dados locais
   */
  clearAuth() {
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Retorna informações de debug
   */
  getDebugInfo() {
    return {
      hasToken: this.hasValidToken(),
      deviceId: this.getOrCreateDeviceId(),
      token: localStorage.getItem(this.tokenKey) || 'Não encontrado'
    };
  }
}

// Exportar para uso
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatAuthManager;
}

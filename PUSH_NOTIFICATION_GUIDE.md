# Guia de Push Notifications - Girls Chat API

## 🔧 Configuração

O sistema de push notifications está configurado usando Expo Server SDK e funciona automaticamente através do middleware `expoPushNotification`.

### Middleware ExpoPushNotification

O middleware captura automaticamente tokens de dispositivos através dos headers da requisição:

```typescript
// Headers necessários na requisição
headers: {
  'expo-notification-token': 'ExponentPushToken[xxxxxx]',
  'expo-notification-id': 'userId'
}
```

## 📱 Como Usar no Frontend React Native

### 1. Instalação das Dependências

```bash
npx expo install expo-notifications expo-device expo-constants
```

### 2. Configuração de Permissions

```javascript
// services/NotificationService.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  async registerForPushNotificationsAsync() {
    let token;
    
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('Falha ao obter token de push notification!');
        return;
      }
      
      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      });
    } else {
      alert('Deve usar um dispositivo físico para Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token?.data;
  }

  // Registrar token no servidor
  async registerTokenWithServer(token, userId) {
    try {
      // Enviar token para qualquer rota que use o middleware
      const response = await fetch('http://localhost:37797/chats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'expo-notification-token': token,
          'expo-notification-id': userId.toString(),
        },
      });

      console.log('Token registrado no servidor');
      return response;
    } catch (error) {
      console.error('Erro ao registrar token:', error);
    }
  }

  // Configurar listeners para notificações
  setupNotificationListeners(navigation) {
    // Listener para quando o app está em foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificação recebida:', notification);
      // Atualizar UI conforme necessário
    });

    // Listener para quando usuário toca na notificação
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const { chatID, otherUserID } = response.notification.request.content.data;
      
      // Navegar para o chat específico
      navigation.navigate('Chat', {
        chatId: chatID,
        otherUserId: otherUserID
      });
    });
  }

  // Limpar listeners
  removeListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default new NotificationService();
```

### 3. Implementação no App Principal

```javascript
// App.js
import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NotificationService from './services/NotificationService';

const Stack = createStackNavigator();

export default function App() {
  const navigationRef = useRef();
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Configurar notificações quando app iniciar
    setupPushNotifications();

    return () => {
      NotificationService.removeListeners();
    };
  }, []);

  const setupPushNotifications = async () => {
    // Obter token de push notification
    const token = await NotificationService.registerForPushNotificationsAsync();
    
    if (token && currentUserId) {
      // Registrar token no servidor
      await NotificationService.registerTokenWithServer(token, currentUserId);
    }

    // Configurar listeners
    NotificationService.setupNotificationListeners(navigationRef.current);
  };

  // Quando usuário fizer login, registrar token
  const handleUserLogin = async (userId) => {
    setCurrentUserId(userId);
    
    const token = await NotificationService.registerForPushNotificationsAsync();
    if (token) {
      await NotificationService.registerTokenWithServer(token, userId);
    }
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        {/* Suas telas aqui */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## 🚀 Rotas com Middleware

### Rotas que Automaticamente Registram Tokens

Qualquer rota que use o middleware `expoPushNotification` automaticamente registrará tokens de dispositivos quando os headers corretos estiverem presentes:

```typescript
// Exemplo no routes.ts
Route.group(() => {
  Route.get('/chats', (ctx) => chatsController.index(ctx))
  Route.get('/mensagens', (ctx) => messagesController.index(ctx))
}).middleware('expoPushNotification')

// Ou em rotas individuais
Route.get('/usuario/:id', (ctx) => usersController.findById(ctx))
  .middleware('expoPushNotification')
```

### Headers Necessários

```javascript
// No frontend, sempre inclua estes headers
headers: {
  'Content-Type': 'application/json',
  'expo-notification-token': 'ExponentPushToken[xxxxxxxxxx]', // Token do Expo
  'expo-notification-id': '123' // ID do usuário
}
```

## 📨 Envio de Notificações

### Quando Notificações São Enviadas

As notificações são enviadas automaticamente pelo `PushNotificationService` quando:
- Uma nova mensagem é criada
- O usuário recebe uma mensagem de outro usuário

### Personalizar Notificações

```typescript
// No PushNotificationService
public async sendNotificationToUser({chatID, otherID, userEmit}) {
  // Personalizar mensagem da notificação
  this.messages.push({
    to: token.expo_token,
    sound: "default",
    title: "Nova Mensagem", // Adicionar título
    body: `Você tem uma nova mensagem de ${userEmit.name}`,
    data: { 
      chatID, 
      otherUserID: userEmit.id,
      type: 'new_message' // Adicionar tipo
    },
    priority: 'high',
    badge: 1 // Adicionar badge
  })
}
```

## 🔧 Configuração do Expo

### 1. app.config.js

```javascript
export default {
  expo: {
    name: "Girls Chat",
    slug: "girls-chat",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.yourcompany.girlschat"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "your-project-id-here"
      }
    },
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#ffffff",
          sounds: ["./assets/sounds/notification.wav"]
        }
      ]
    ]
  }
};
```

## 🛠️ Debugging

### Logs do Servidor

O servidor registra logs úteis:

```
Nova mensagem emitida para o chat 1
Erro ao enviar notificação push: [erro]
Token adicionado para usuário: 123
```

### Testando Notificações

```javascript
// Teste manual de notificação
const testNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Teste",
      body: "Esta é uma notificação de teste",
      data: { chatID: "1", otherUserID: "2" },
    },
    trigger: { seconds: 1 },
  });
};
```

## 🚨 Troubleshooting

### Problemas Comuns:

1. **Token não registrado**: Verifique se os headers estão sendo enviados corretamente
2. **Notificações não chegam**: Verifique se o token é válido e se as permissões foram concedidas
3. **App não navega ao tocar**: Verifique se os listeners estão configurados corretamente

### Variáveis de Ambiente:

```env
# .env
EXPO_ACCESS_TOKEN=your_expo_access_token_here
```

O sistema está pronto para uso! 🎉

# Guia de Upload de Foto de Perfil - Girls Chat API

## 🖼️ Campo Profile Picture Adicionado

O campo `profile_picture` foi adicionado ao modelo User para armazenar o caminho da foto de perfil.

### 📁 Estrutura no Banco de Dados

```sql
-- Campo adicionado à tabela users
profile_picture VARCHAR(255) NULL
```

### 🔧 Modelo User Atualizado

```typescript
// app/Models/User.ts
@column()
public profile_picture: string
```

## 📤 Upload de Imagens

### 1. Configuração de Storage

Adicione ao `config/drive.ts`:

```typescript
import { DriveConfig } from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'

const driveConfig: DriveConfig = {
  disk: Env.get('DRIVE_DISK'),
  disks: {
    local: {
      driver: 'local',
      visibility: 'public',
      root: './uploads',
      basePath: '/uploads',
      serveFiles: true,
    },
    s3: {
      driver: 's3',
      visibility: 'public',
      key: Env.get('S3_KEY'),
      secret: Env.get('S3_SECRET'),
      region: Env.get('S3_REGION'),
      bucket: Env.get('S3_BUCKET'),
      endpoint: Env.get('S3_ENDPOINT'),
    }
  }
}

export default driveConfig
```

### 2. Middleware de Upload

Crie `app/Middleware/UploadFile.ts`:

```typescript
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UploadFile {
  public async handle({ request }: HttpContextContract, next: () => Promise<void>) {
    const profilePicture = request.file('profile_picture', {
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg', 'gif', 'webp']
    })

    if (profilePicture) {
      await profilePicture.moveToDisk('uploads/profiles', {
        name: `${new Date().getTime()}.${profilePicture.extname}`,
        overwrite: true,
      }, 'local')

      // Adicionar caminho ao request
      request.updateBody({
        ...request.body(),
        profile_picture: profilePicture.filePath
      })
    }

    await next()
  }
}
```

### 3. Registrar Middleware

No `start/kernel.ts`:

```typescript
Server.middleware.registerNamed({
  expoPushNotification: () => import('App/Middleware/ExpoPushNotification'),
  uploadFile: () => import('App/Middleware/UploadFile')
})
```

### 4. Criar Controller de Upload

```typescript
// app/Controllers/Http/UploadController.ts
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import { v4 as uuid } from 'uuid'
import UserService from 'App/services/UserService'

export default class UploadController {
  public async uploadProfilePicture({ request, response, params }: HttpContextContract) {
    try {
      const userID = params.id
      const profilePicture = request.file('profile_picture', {
        size: '5mb',
        extnames: ['jpg', 'png', 'jpeg', 'gif', 'webp']
      })

      if (!profilePicture) {
        return response.badRequest({ success: false, msg: 'Nenhuma imagem foi enviada' })
      }

      if (!profilePicture.isValid) {
        return response.badRequest({ 
          success: false, 
          msg: 'Arquivo inválido', 
          errors: profilePicture.errors 
        })
      }

      // Gerar nome único para o arquivo
      const fileName = `${uuid()}.${profilePicture.extname}`
      
      // Mover arquivo para pasta uploads/profiles
      await profilePicture.move(Application.tmpPath('uploads/profiles'), {
        name: fileName,
        overwrite: true
      })

      // Caminho relativo para salvar no banco
      const filePath = `uploads/profiles/${fileName}`

      // Atualizar usuário com nova foto
      const userService = new UserService()
      const user = await userService.updateUser(userID, {
        profile_picture: filePath
      })

      return response.json({
        success: true,
        message: 'Foto de perfil atualizada com sucesso',
        user: user,
        filePath: filePath
      })

    } catch (error) {
      return response.badRequest({
        success: false,
        msg: 'Erro ao fazer upload da imagem: ' + error.message
      })
    }
  }

  public async getProfilePicture({ params, response }: HttpContextContract) {
    try {
      const { filename } = params
      const filePath = Application.tmpPath('uploads/profiles', filename)
      
      return response.download(filePath)
    } catch (error) {
      return response.notFound({
        success: false,
        msg: 'Imagem não encontrada'
      })
    }
  }
}
```

### 5. Adicionar Rotas

No `start/routes.ts`:

```typescript
// Importar controller
import UploadController from 'App/Controllers/Http/UploadController'

const uploadController = new UploadController()

// Rotas de upload
Route.post('/usuario/:id/upload-foto', (ctx) => uploadController.uploadProfilePicture(ctx))
Route.get('/uploads/profiles/:filename', (ctx) => uploadController.getProfilePicture(ctx))

// Atualizar rota existente para incluir upload
Route.put('/atualizar-usuario/:id', (ctx) => usersController.update(ctx))
  .middleware('uploadFile')
```

## 📱 Frontend React Native

### 1. Instalação de Dependências

```bash
npm install react-native-image-picker
# ou
expo install expo-image-picker
```

### 2. Componente de Upload

```javascript
// components/ProfilePictureUpload.js
import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const ProfilePictureUpload = ({ userId, currentImageUrl, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permissão necessária", "Permissão para acessar a galeria é necessária!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permissão necessária", "Permissão para acessar a câmera é necessária!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (image) => {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('profile_picture', {
      uri: image.uri,
      type: image.type || 'image/jpeg',
      name: image.fileName || `profile_${Date.now()}.jpg`,
    } as any);

    try {
      const response = await fetch(`http://localhost:37797/usuario/${userId}/upload-foto`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert("Sucesso", "Foto de perfil atualizada!");
        if (onUploadSuccess) {
          onUploadSuccess(data.filePath);
        }
      } else {
        Alert.alert("Erro", data.msg || "Erro ao fazer upload");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro de conexão: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      "Selecionar Foto",
      "Escolha de onde você quer selecionar uma foto",
      [
        { text: "Galeria", onPress: pickImage },
        { text: "Câmera", onPress: takePhoto },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  return (
    <View style={{ alignItems: 'center', margin: 20 }}>
      <TouchableOpacity onPress={showImageOptions} disabled={uploading}>
        {currentImageUrl ? (
          <Image
            source={{ uri: `http://localhost:37797/${currentImageUrl}` }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: '#f0f0f0'
            }}
          />
        ) : (
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: '#f0f0f0',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{ color: '#666' }}>Adicionar Foto</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <Text style={{ marginTop: 10, color: '#666' }}>
        {uploading ? 'Enviando...' : 'Toque para alterar foto'}
      </Text>
    </View>
  );
};

export default ProfilePictureUpload;
```

### 3. Usando o Componente

```javascript
// screens/ProfileScreen.js
import React, { useState } from 'react';
import ProfilePictureUpload from '../components/ProfilePictureUpload';

const ProfileScreen = ({ userId }) => {
  const [user, setUser] = useState({});

  const handleUploadSuccess = (newImagePath) => {
    setUser(prevUser => ({
      ...prevUser,
      profile_picture: newImagePath
    }));
  };

  return (
    <View>
      <ProfilePictureUpload
        userId={userId}
        currentImageUrl={user.profile_picture}
        onUploadSuccess={handleUploadSuccess}
      />
      {/* Resto do perfil */}
    </View>
  );
};
```

## 🔧 Exemplo de Atualização Completa

```javascript
// Atualizar perfil completo incluindo foto
const updateProfile = async (userId, profileData) => {
  const formData = new FormData();
  
  // Adicionar dados do perfil
  Object.keys(profileData).forEach(key => {
    if (key !== 'profile_picture' && profileData[key]) {
      formData.append(key, profileData[key]);
    }
  });
  
  // Adicionar foto se houver
  if (profileData.profile_picture) {
    formData.append('profile_picture', profileData.profile_picture);
  }

  const response = await fetch(`http://localhost:37797/atualizar-usuario/${userId}`, {
    method: 'PUT',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.json();
};
```

## 📂 Estrutura de Pastas

```
uploads/
└── profiles/
    ├── uuid1.jpg
    ├── uuid2.png
    └── uuid3.jpeg
```

## ⚙️ Configurações Necessárias

### .env
```env
DRIVE_DISK=local
```

### package.json (adicionar se necessário)
```json
{
  "dependencies": {
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/uuid": "^9.0.0"
  }
}
```

O sistema de upload de fotos está pronto! 📸✨

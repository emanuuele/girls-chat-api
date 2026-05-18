// app/Services/FirebaseAdmin.ts (ou similar)
import admin from 'firebase-admin'
import Env from '@ioc:Adonis/Core/Env'
import Application from '@ioc:Adonis/Core/Application'

export class FirebaseAdminService {
  public static init() {
    if (!admin.apps.length) {
      const serviceAccountPath = Application.makePath('config', '../../firebase-service-account.json')
      const serviceAccount = require(serviceAccountPath)

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: Env.get('BUCKET_NAME', 'girls-chat-a2baa.appspot.com'), // Seu bucket padrão
      })
    }
  }

  public static getStorage() {
    return admin.storage()
  }
}

// Chame FirebaseAdminService.init() em um AppProvider ou em um boot file.
// Ex: Em providers/AppProvider.ts no método `boot()`:
// import FirebaseAdminService from 'App/Services/FirebaseAdmin'
// FirebaseAdminService.init()

export default FirebaseAdminService

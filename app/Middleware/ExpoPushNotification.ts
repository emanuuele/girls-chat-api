import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PushNotificationService from 'App/services/PushNotificationService';

export default class ExpoPushNotification {
  public async handle({ request }: HttpContextContract, next: () => Promise<void>) {
    const expoToken = request.headers['expo-notification-token']
    const userID = request.headers['expo-notification-id']
    if (expoToken && userID) {
      await new PushNotificationService().addUserToken({ token: expoToken, userID });
    }
    await next()
  }
}

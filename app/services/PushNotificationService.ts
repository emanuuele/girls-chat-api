import TokenUser from "App/Models/TokenUser";
import User from "App/Models/User";
import Expo, { ExpoPushMessage } from 'expo-server-sdk'

export default class PushNotificationService {
    private expo = new Expo({
        accessToken: process.env.EXPO_ACCESS_TOKEN,
        useFcmV1: true,
    })
    private messages: ExpoPushMessage[] = [];

    public async sendNotificationToUser({chatID, otherID, userEmit}:{chatID: string, otherID: string, userEmit: User}): Promise<void> {
        try {
            let tokens = await TokenUser.query().where('id_user', otherID);
            for (const token of tokens) {
                if (!Expo.isExpoPushToken(token.expo_token)) {
                    console.error("Não é um token válido");
                    continue;
                }
                this.messages.push({
                    to: token.expo_token,
                    sound: "default",
                    body: `Você tem uma nova mensagem de ${userEmit.name}`,
                    data: { chatID, otherUserID: userEmit.id},
                    priority: 'high'
                })
            }
            await this.sendPushNotifications();
        } catch (error) {
            throw new Error("Erro ao enviar notificação push: " + error.message);
        }
    }

    private async sendPushNotifications(): Promise<void> {
        try {
            const chunks = this.expo.chunkPushNotifications(this.messages);
            for (const chunk of chunks) {
                await this.expo.sendPushNotificationsAsync(chunk);
            }
        } catch (error) {
            throw new Error("Erro ao enviar notificação push: " + error.message);
        }
    }

    public async addUserToken({token, userID}) {
        try {
            let tokenCreated = await TokenUser.query().where('expo_token', token).where('id_user', userID).first();
            if(!tokenCreated) {
                tokenCreated = await TokenUser.create({expo_token: token, id_user: userID});
            }
            return tokenCreated;
        } catch (error) {
            throw new Error("Erro ao adicionar token do dispositivo ao banco de dados: " + (error as Error).message);
        }
    }

    public async removeUserToken(token: string) {
        try {
            let tokenCreated = await TokenUser.query().where('expo_token', token).first();
            if(tokenCreated) {
                await tokenCreated.delete();
            }            
        } catch (error) {
            throw new Error("Erro ao adicionar token do dispositivo ao banco de dados: " + (error as Error).message);
        }
    }
}
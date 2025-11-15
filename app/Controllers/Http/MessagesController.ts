import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import MessagesService from 'App/services/MessagesService';

export default class MessagesController {
    private messagesService = new MessagesService();
    public async index({ response, request }: HttpContextContract) {
        try {
            const chatID = request.input('chatID');
            const messages = await this.messagesService.getMessagesByChatID(chatID);
            return response.json({ success: true, data: messages })
        } catch (e) {
            return response.json({ success: false, msg: e.message });
        }
    }

    public async create({ request, response }: HttpContextContract) {
        try {
            const { chatID, sentBy, sentTo, text } = request.body();
            const newMessage = {
                sentBy,
                sentTo,
                text,
                seen: false
            };
            const messageRef = await this.messagesService.createMessage(newMessage);
            return response.json({ success: true, data: messageRef });
        } catch (e) {
            return response.json({ success: false, msg: e.message });
        }
    }

    public async updateSeenStatus({ response, params, request }: HttpContextContract) {
        try {
            const chatID = params.id;
            const loggedUserID = request.input('userID');
            await this.messagesService.updateMessageSeenStatus(chatID, loggedUserID);
            return response.json({ success: true, msg: "Status atualizado com sucesso" });
        } catch (e) {
            return response.json({ success: false, msg: e.message });
        }
    }
}

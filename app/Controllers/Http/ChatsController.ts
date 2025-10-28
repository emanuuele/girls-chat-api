import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import ChatsService from 'App/services/ChatsService';

export default class ChatsController {
    private chatsService = new ChatsService();
    public async index({ request, response }: HttpContextContract) {
        try {
            const userID = request.input('userID');
            const uniqueChats = await this.chatsService.getUserChats(userID);
            return response.json({ success: true, chats: uniqueChats });
        } catch (error) {
            return response.json({ success: false, msg: error.message });
        }
    }

    public async show({ response, params }: HttpContextContract) {
        try {
            const chatID = params.id.split('%')[0];
            const chat = await this.chatsService.showChat(chatID);
            if (!chat) {
                throw new Error("Chat não encontrado");
            }
            return response.json({ success: true, chat });
        } catch (error) {
            return response.json({ success: false, msg: error.message });
        }
    }

    public async create({ request, response }: HttpContextContract) {
        try {
            const { hostID, participantID } = request.body();
            const chat = await this.chatsService.createChat(hostID, participantID);
            return response.json({ success: true, chat });
        } catch (error) {
            return response.json({ success: false, msg: error.message });
        }
    }
}

import Message from "App/Models/Message";
import ChatsService from "./ChatsService";
import Ws from "./IoSocketServer";

export default class MessagesService {
    public async getMessagesByChatID(chatID: string) {
        try {
            if (!chatID) {
                throw new Error("O ID do chat é obrigatório")
            }
            const messages = await Message.query().where('id_chat', chatID).orderBy('created_at', 'asc');
            return messages;
        } catch (error) {
            throw new Error("Erro ao buscar mensagens: " + error.message);
        }
    }

    public async createMessage(newMessage: { sentBy: string; sentTo: string; text: string; }) {
        try {
            if (!newMessage.sentBy || !newMessage.sentTo || !newMessage.text) {
                throw new Error("Os campos sentBy, sentTo e text são obrigatórios");
            }
            const chatsService = new ChatsService();
            let chatID: string | number | null = null;
            const existingChat = await chatsService.chatBetweenUsers(newMessage.sentBy, newMessage.sentTo);
            if (!existingChat) {
                const chat = await chatsService.createChat(newMessage.sentBy, newMessage.sentTo);
                chatID = chat.id;
            }
            const messageRef = await Message.create({
                id_chat: Number(chatID) || existingChat?.id,
                sentBy: Number(newMessage.sentBy),
                sentTo: Number(newMessage.sentTo),
                text: newMessage.text,
                seen: false,
            });
            await chatsService.updateLastMessage(chatID || existingChat?.id || 0, newMessage.text);
            
            const finalChatId = Number(chatID) || existingChat?.id || 0;
            Ws.emitNewMessage(finalChatId, messageRef);

            return messageRef;
        } catch (error) {
            throw new Error("Erro ao criar mensagem: " + error.message);
        }
    }

    public async updateMessageSeenStatus(chatID: string, loggedUserID: string) {
        try {
            if (!chatID) {
                throw new Error("O ID do chat é obrigatório");
            }
            const chat = await new ChatsService().showChat(chatID);
            if (!chat) {
                throw new Error("Chat não encontrado");
            }
            await Message.query().where('id_chat', chatID).whereNot('sentBy', loggedUserID).update({ seen: true });
        } catch (error) {
            throw new Error("Erro ao atualizar status das mensagens: " + error.message);
        }
    }
}
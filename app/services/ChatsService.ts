import Chat from "App/Models/Chat";
import User from "App/Models/User";
import { DateTime } from "luxon";

export default class ChatsService {
    public async getUserChats(userID: string) {
        try {
            if (!userID) {
                throw new Error("O ID do usuário é obrigatório")
            }
            const chats = await Chat.query()
                .where('id_host', userID)
                .orWhere('participant', userID)
                .preload('host')
                .preload('participantUser')
                .preload('messages', (messagesQuery) => {
                    messagesQuery
                        .where((query) => {
                            query.where('seen', false).whereNot('sentBy', userID)
                        })
                })
                .orderBy('last_message_at', 'desc');

            return chats;
        } catch (error) {
            throw new Error("Erro ao buscar chats do usuário: " + error.message);
        }
    }

    public async showChat(chatID: string) {
        try {
            if (!chatID) {
                throw new Error("O ID do chat é obrigatório")
            }
            const chat = await Chat.query()
                .where('id', chatID)
                .preload('messages', (messagesQuery) => {
                    messagesQuery
                        .preload('sender')
                        .preload('receiver')
                        .orderBy('created_at', 'asc')
                })
                .preload('host')
                .preload('participantUser')
                .first();

            if (!chat) {
                throw new Error("Chat não encontrado");
            }
            return chat;
        } catch (error) {
            throw new Error("Erro ao buscar o chat: " + error.message);
        }
    }

    public async createChat(host: string, participant: string) {
        try {
            if (!host || !participant) {
                throw new Error("Os IDs do host e participante são obrigatórios")
            }

            // Validar se os usuários existem
            const hostUser = await User.find(parseInt(host));
            const participantUser = await User.find(parseInt(participant));

            if (!hostUser) {
                throw new Error(`Usuário host com ID ${host} não encontrado`);
            }

            if (!participantUser) {
                throw new Error(`Usuário participante com ID ${participant} não encontrado`);
            }

            const existingChat = await this.chatBetweenUsers(host, participant);

            if (existingChat) {
                throw new Error("Chat já existe entre esses usuários");
            }
            
            const newChat = await Chat.create({
                id_host: parseInt(host),
                participant: parseInt(participant),
            });
            await newChat.load('host');
            await newChat.load('participantUser');
            return newChat;
        } catch (error) {
            throw new Error("Erro ao criar o chat: " + error.message);
        }
    }

    public async chatBetweenUsers(userA: string, userB: string) {
        try {
            if (!userA || !userB) {
                throw new Error("Os IDs dos usuários são obrigatórios")
            }

            const existingChat = await Chat.query()
                .where((query) => {
                    query.where('id_host', userA).andWhere('participant', userB)
                })
                .orWhere((query) => {
                    query.where('id_host', userB).andWhere('participant', userA)
                })
                .first();

            return existingChat;
        } catch (error) {
            throw new Error("Erro ao verificar existência do chat: " + error.message);
        }
    }

    public async updateLastMessage(chatID: string | number, messageText: string) {
        try {
            if (!chatID || !messageText) {
                throw new Error("O ID do chat e o texto da mensagem são obrigatórios")
            }
            const chat = await Chat.find(chatID);
            if (!chat) {
                throw new Error("Chat não encontrado");
            }
            chat.last_message = messageText;
            chat.last_message_at = DateTime.now();
            await chat.save();
        } catch (error) {
            throw new Error("Erro ao atualizar a última mensagem do chat: " + error.message);
        }
    }
}
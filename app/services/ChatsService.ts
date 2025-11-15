import Chat from "App/Models/Chat";
import Participant from "App/Models/Participant";
import User from "App/Models/User";
import { DateTime } from "luxon";

export default class ChatsService {
    public async getUserChats(userID: string) {
        try {
            if (!userID) {
                throw new Error("O ID do usuário é obrigatório")
            }

            // Buscar chats onde o usuário é participante
            const userParticipations = await Participant.query()
                .where('id_user', userID)
                .preload('chat', (chatQuery) => {
                    chatQuery
                        .preload('host')
                        .preload('messages', (messagesQuery) => {
                            messagesQuery
                                .where((query) => {
                                    query.where('seen', false).whereNot('sentBy', userID)
                                })
                        })
                })
                .orderBy('created_at', 'desc');

            if (!userParticipations.length) {
                return [];
            }

            const chatsWithParticipants = await Promise.all(
                userParticipations.map(async (participation) => {
                    const chat = participation.chat;
                    
                    // Buscar outros participantes do chat (excluindo o usuário atual)
                    const otherParticipants = await Participant.query()
                        .where('id_chat', chat.id)
                        .whereNot('id_user', userID)
                        .preload('user')

                    return { 
                        ...chat.toJSON(), 
                        otherParticipants: otherParticipants.map(p => p.user)
                    };
                })
            );

            // Ordenar por última mensagem usando any para evitar erro de tipo
            chatsWithParticipants.sort((a: any, b: any) => {
                const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
                const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
                return dateB - dateA;
            });

            return chatsWithParticipants;
        } catch (error) {
            throw new Error("Erro ao buscar chats do usuário: " + error.message);
        }
    }

    public async showChat(chatID: string, userLoggedID?: string) {
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
                .first();
            if (!chat) {
                throw new Error("Chat não encontrado");
            }
            if (userLoggedID) {
                let participants = await Participant.query()
                    .where('id_chat', chat.id)
                    .andWhere((query) => {
                        query.whereNot('id_user', userLoggedID)
                    });
                return { ...chat.toJSON(), participant: participants.map(p => p.user)};
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
            });
            await Participant.create({
                id_chat: newChat.id,
                id_user: parseInt(host),
            });
            await Participant.create({
                id_chat: newChat.id,
                id_user: parseInt(participant),
            });
            await newChat.load('host');
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

            // Buscar chats onde ambos os usuários são participantes
            const chatsUserA = await Participant.query()
                .where('id_user', userA)
                .select('id_chat');

            const chatsUserB = await Participant.query()
                .where('id_user', userB)
                .select('id_chat');

            const chatIdsA = chatsUserA.map(p => p.id_chat);
            const chatIdsB = chatsUserB.map(p => p.id_chat);

            // Encontrar chat comum entre os dois usuários
            const commonChatIds = chatIdsA.filter(id => chatIdsB.includes(id));

            if (commonChatIds.length > 0) {
                const existingChat = await Chat.find(commonChatIds[0]);
                return existingChat;
            }

            return null;
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

    public async addParticipantToChat(chatID: number, userID: number) {
        try {
            const chat = await Chat.find(chatID);
            if (!chat) {
                throw new Error("Chat não encontrado");
            }

            const user = await User.find(userID);
            if (!user) {
                throw new Error("Usuário não encontrado");
            }

            // Verificar se o usuário já é participante
            const existingParticipant = await Participant.query()
                .where('id_chat', chatID)
                .where('id_user', userID)
                .first();

            if (existingParticipant) {
                throw new Error("Usuário já é participante do chat");
            }

            // Adicionar novo participante
            const newParticipant = await Participant.create({
                id_chat: chatID,
                id_user: userID
            });

            return newParticipant;
        } catch (error) {
            throw new Error("Erro ao adicionar participante ao chat: " + error.message);
        }
    }

    public async removeParticipantFromChat(chatID: number, userID: number) {
        try {
            const participant = await Participant.query()
                .where('id_chat', chatID)
                .where('id_user', userID)
                .first();

            if (!participant) {
                throw new Error("Participante não encontrado no chat");
            }

            await participant.delete();
            return true;
        } catch (error) {
            throw new Error("Erro ao remover participante do chat: " + error.message);
        }
    }

    public async getChatParticipants(chatID: number) {
        try {
            const participants = await Participant.query()
                .where('id_chat', chatID)
                .preload('user');

            return participants.map(p => p.user);
        } catch (error) {
            throw new Error("Erro ao buscar participantes do chat: " + error.message);
        }
    }
}
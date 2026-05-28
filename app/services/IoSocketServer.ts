import Server from '@ioc:Adonis/Core/Server'
import Message from 'App/Models/Message';
import { Server as SocketIoServer } from 'socket.io'

class Ws extends SocketIoServer {
  public io: SocketIoServer;
  private booted = false

  public boot() {
    if (this.booted) {
      return
    }

    this.booted = true
    this.io = new SocketIoServer(Server.instance!, {
      cors: {
        origin: [
          "*", 
        ],
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    })

  }

  public emitNewMessage(chatId: number, message: Message) {
    if (this.io) {
      this.io.emit(`new-message-${chatId}`, { id: message.id, text: message.text, sentBy: message.sentBy, sentTo: message.sentTo, createdAt: message.createdAt });
      console.log(`Nova mensagem emitida para o chat ${chatId}`)
    }
  }
}

export default new Ws()
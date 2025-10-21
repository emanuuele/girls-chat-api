import Server from '@ioc:Adonis/Core/Server'
import { Server as SocketIoServer } from 'socket.io'

class Ws extends SocketIoServer {
  public io: SocketIoServer;
  private booted = false

  public boot() {
    if (this.booted) {
      return
    }

    this.booted = true
    this.io = new SocketIoServer(Server.instance!)
  }
}

export default new Ws()
import MessagesService from "App/services/MessagesService"
import ws from "../app/services/IoSocketServer"

ws.boot()

ws.io.on('connection', (socket) => {
    socket.on('send-message', (data) => {
      const messagesService = new MessagesService();
      const { sentByID, sentToID, text } = data;
      const newMessage = {
          sentBy: sentByID,
          sentTo: sentToID,
          text,
          createdAt: new Date(),
          seen: false
      };
      messagesService.createMessage(newMessage).then((messageRef) => {
          const message = { id: messageRef.id, ...newMessage };
          
          ws.io.emit(`receive-message-${sentToID}`, message);
          ws.io.emit(`receive-message-${sentByID}`, message);
      }).catch((error) => {
          console.error("Erro ao criar mensagem via WebSocket: " + error.message);
      });
    })
})
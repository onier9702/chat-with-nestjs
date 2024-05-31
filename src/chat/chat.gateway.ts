import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { ChatService } from './chat.service';

// STEPS: 
// 1- implements this class from OnModuleInit
// 2- create the server property to get all data related
// 3- property server from socket.io have all the information about clients connected and 
// allow to receive and send messages

@WebSocketGateway()
export class ChatGateway implements OnModuleInit {

  @WebSocketServer() // add this decorator to server property
  public server: Server; // from npm i socket.io

  constructor(private readonly chatService: ChatService) {}

  onModuleInit() {
    
    this.server.on('connection', (socket: Socket) => {

      // console.log(socket); // all the information we need

      // Never store on DB this ID so it changes easy
      // console.log('Client connected: ', socket.id); // every time user connect and disconnect this ID change

      const { username, token } = socket.handshake.auth; // Get the token come from frontend and any info sent
      console.log(token, username);

      if (!token) { // if token is not valid disconect that user
        socket.disconnect(); // close that connection (only that, not all the connection)
        throw new UnauthorizedException('Token not valid');
      }

      // Append a new client to the list   // change in real life for uid of user authenticated instead of id
      this.chatService.onClientConnected({ id: socket.id, name: username });

      // Welcome message   // only the client connected will receive this message
      socket.emit('welcome-message', 'Welcome to this amazing chat');

      // To notify all the clients connected use the server(all the clients) instead of a single socket(one client)
      this.server.emit('on-clients-changed', this.chatService.getClients()); // sending list of all connected clients to frontend
      
      

      socket.on('disconnect', () => {
        this.chatService.onClientDisconnected(socket.id);
        // console.log('Client is disconnected: ', socket.id);
        this.server.emit('on-clients-changed', this.chatService.getClients()); // sending list of all connected clients to frontend
      });

    });

  }

  @SubscribeMessage('chat-message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ) {

    const { username, token } = client.handshake.auth;

    if (!message) {
      return;
    }

    this.server.emit('on-message', {
      userId: client.id,
      message: message,
      name: username,
    });

  }

}

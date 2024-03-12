import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatStateManager } from './state-manager';
import { LoggerService } from 'src/logger/logger.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class UserConversationService {
  private readonly clients: Map<string, Socket> = new Map();
  constructor(
    private readonly chatStateManager: ChatStateManager,
    private readonly  logger: LoggerService,
  ) { }

  @WebSocketServer()
  serverSocket: Socket

  @SubscribeMessage('request')
  async handleMessage(@MessageBody() body: any, @ConnectedSocket() clientSocket: Socket) {
    //1. extract input data
    console.log(body)
    const data = JSON.parse(body)
    console.log('client socket ', clientSocket)
    const headers = clientSocket.handshake.headers
    console.log('headers ', headers) 
    const clientId: string = String(headers.client_id) 

    let client = this.clients.get(clientId); // Check if a client connection exists for the user

    if (!client) {
      // If no client exists for the user, create a new one
      client = clientSocket;
      this.clients.set(clientId, client);
    }
    

    //2. preprocess
    const fres = await this.preprocess(headers, data)

    //4.emit the response
    client.emit('response', fres)
  }

  async preprocess (headers, req) {
    try {
      //2.call state
    // const finalState = await this.states(intialState)
    const r = {
      "message": {
        "text": "string",
        "audio": ".wav" //optional
      },
      "session_id": "string", // session id is tracking a particular conversation
      "metadata":{}
    }

    //3.reframe response through ai
      const res =  await this.chatStateManager.states(1)
      this.logger.info(`res ${res}`)
      const fres = {
        "status": "enum",
        "session_id": "string",
        "message": "string",
        "options": [],
        "end_connection": false,
        "prompt": "enum",
        "metadata":{}
      }
      return fres
    } catch (error) {
      this.logger.error('error occured in state manager ', error)
      return error
    }
  }
}

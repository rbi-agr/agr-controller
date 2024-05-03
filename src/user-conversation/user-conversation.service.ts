import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatStateManager } from './state-manager';
import { RuleEngine } from './rule-engine';
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
    private ruleEngine: RuleEngine
  ) { }

  @WebSocketServer()
  serverSocket: Socket

  @SubscribeMessage('request')
  async handleMessage(@MessageBody() body: any, @ConnectedSocket() clientSocket: Socket) {
    //1. extract input data
    console.log(body)
    const data = JSON.parse(JSON.stringify(body))
    // console.log('client socket ', clientSocket)
    const headers = clientSocket.handshake.headers
    // console.log('headers ', headers) 
    // const clientId: string = String(headers.client_id)
    
    const sessionId = data.session_id

    let client = this.clients.get(sessionId); // Check if a client connection exists for the user

    if (!client) {
      // If no client exists for the user, create a new one
      client = clientSocket;
      this.clients.set(sessionId, client);
    }
    

    //2. preprocess
    const fres = await this.preprocess(headers, data)
    console.log(fres)
    
    //4.emit the response
    for(let resObj of fres){
      client.emit('response', resObj)

      if(resObj.end_connection) {
        await this.closeConnection(sessionId)
      }
    }
  }

  async preprocess (headers, req) {
    try {
      const fres = await this.ruleEngine.preprocessDataForMultipleUseCases(headers, req)
      return fres
    } catch (error) {
      this.logger.error('error occured in state manager ', error)
      return error
    }
  }

  async closeConnection(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      client.disconnect();
      this.clients.delete(clientId);
      console.log(`Connection closed for client ID: ${clientId}`);
    } else {
      console.log(`Client ID ${clientId} not found.`);
    }
  }

  // @OnDisconnect()
  // handleDisconnect(client: Socket) {
  //   console.log(`Client disconnected: ${client.id}`);
  //   // Remove the client from the Map when it disconnects
  //   this.clients.forEach((value, key) => {
  //     if (value === client) {
  //       this.clients.delete(key);
  //       console.log(`Removed client with ID: ${key}`);
  //     }
  //   });
  // }
}

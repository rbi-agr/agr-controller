import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import * as jwtConstants from '../utils/constants';

@Injectable()
export class WsJwtGuard implements CanActivate {
  
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    console.log('Inside Auth Guard')
    if(context.getType() !== 'ws') {
      return false;
    }
    const client: Socket = context.switchToWs().getClient()

    WsJwtGuard.validateToken(client)
    return true
  }

  static validateToken(client: Socket) {
    // For postman testing
    // const { authorization } = client.handshake.headers;
    // const token = authorization.split(' ')[1]

    const token = client.handshake.auth.token;
    
    const payload = verify(token, jwtConstants.jwtSecret);
    return payload
  }
}

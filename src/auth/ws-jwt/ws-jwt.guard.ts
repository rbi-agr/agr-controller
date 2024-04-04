import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    console.log('Inside Auth Guard')
    if(context.getType() !== 'ws') {
      console.log('inside here')
      return true;
    }
    
    const client: Socket = context.switchToWs().getClient()

    WsJwtGuard.validateToken(client)
    return true
  }


  static validateToken(client: Socket) {
    const { authorization } = client.handshake.headers;
    console.log(authorization)
    const token = authorization.split(' ')[1]
    const payload = verify(token, 'seckret-key');
    return payload
  }
}

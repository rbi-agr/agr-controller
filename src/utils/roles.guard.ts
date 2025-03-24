import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true; // Allow access if no roles are defined
    }

    const client = context.switchToWs().getClient(); // Get the WebSocket client
    const user = client.handshake?.auth?.user; // Extract user info from handshake

    if (!user || !user.role || !roles.includes(user.role)) {
      throw new UnauthorizedException('Access denied: insufficient role');
    }

    return true;
  }
}

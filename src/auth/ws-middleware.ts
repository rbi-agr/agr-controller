import { Socket } from "socket.io";
import { WsJwtGuard } from "./ws-jwt/ws-jwt.guard";
import { Logger } from "@nestjs/common";

export type SocketIOMiddleware = {
    (client: Socket, next: (err?: Error) => void)
}

export const SocketAuthMiddleware = (): SocketIOMiddleware => {
    return (client, next) => {
        try {
            WsJwtGuard.validateToken(client);
            next();
        } catch (error) {
            Logger.error(error)
            next (error)
        }
    }
}
import { Socket } from "socket.io";
import { WsJwtGuard } from "./ws-jwt/ws-jwt.guard";

export type SocketIOMiddleware = {
    (client: Socket, next: (err?: Error) => void)
}

export const SocketAuthMiddleware = () => {
    return (client, next) => {
        try {
            WsJwtGuard.validateToken(client);
            next();
        } catch (error) {
            next (error)
        }
    }
}
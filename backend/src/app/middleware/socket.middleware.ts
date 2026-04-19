import { Socket } from "socket.io";
import { verifyToken } from "../utils/jwt";

export const socketAuthMiddleware = (socket: Socket, next: (err?: any) => void) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      // Allow guest connections without attaching a user
      return next();
    }

    const decoded = verifyToken(token) as { id: string; role: string; status: string };

    if (decoded.status === "deleted") {
      return next(new Error("Authentication error: Account deactivated"));
    }

    // Attach user data to socket
    (socket as any).user = decoded;
    next();
  } catch (error) {
    // For invalid tokens, we still allow the connection as a guest
    // but we don't attach the user
    next();
  }
};

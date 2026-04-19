import { Server } from "socket.io";

export class SocketService {
  private static io: Server;

  static init(io: Server) {
    this.io = io;
  }

  static emitToRoom(room: string, event: string, payload: any) {
    if (this.io) {
      this.io.to(room).emit(event, payload);
    }
  }

  static emitToUser(userId: string, event: string, payload: any) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, payload);
    }
  }

  static emitToAll(event: string, payload: any) {
    if (this.io) {
      this.io.emit(event, payload);
    }
  }

  static getIO(): Server {
    return this.io;
  }
}

import { socket } from "@/lib/socket";

export interface SocketContextType {
  isConnected: boolean;
  emit: (event: string, ...args: any[]) => void;
  socket: typeof socket;
}

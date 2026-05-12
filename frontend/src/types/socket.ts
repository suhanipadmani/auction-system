import { socket } from "@/lib/socket";

export interface ISocketContextType {
  isConnected: boolean;
  emit: (event: string, ...args: any[]) => void;
  socket: typeof socket;
}

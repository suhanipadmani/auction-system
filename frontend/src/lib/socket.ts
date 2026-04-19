import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  auth: (cb) => {

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("auth-storage");
        const token = raw ? JSON.parse(raw)?.state?.token : null;
        cb({ token });
      } catch {
        cb({ token: null });
      }
    } else {
      cb({ token: null });
    }
  },
});

// Helper for debugging in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  socket.on("connect", () => console.log("Socket connected:", socket.id));
  socket.on("disconnect", () => console.log("Socket disconnected"));
  socket.on("connect_error", (err) => console.error("Socket Connection Error:", err.message));
}

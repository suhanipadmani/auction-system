"use client";

import React, { createContext, useContext, useEffect, useCallback } from "react";
import { socket } from "@/lib/socket";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";

import { ISocketContextType } from "@/types/socket";


const SocketContext = createContext<ISocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, _hasHydrated } = useAuthStore();
  const [isConnected, setIsConnected] = React.useState<boolean>(socket.connected);

  const connect = useCallback(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  useEffect(() => {
    if (_hasHydrated) {
      connect();
    }
  }, [_hasHydrated, connect]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      // Explicitly join user room after connection
      if (user?._id) {
        socket.emit("join_user", user._id);
      }
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onNotification(data: any) {
      if (data.type === "NOTIFICATION_RECEIVED") {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-zinc-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    New Notification
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {data.payload.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        ), { duration: 5000 });
      }
    }

    function onGlobalNotification(data: any) {
      if (data.type === "NEW_AUCTION_ANNOUNCEMENT") {
        toast(data.payload.message, {
          icon: '🚀',
          duration: 6000,
          position: "top-center",
          style: {
            borderRadius: '10px',
            background: '#4f46e5',
            color: '#fff',
            fontWeight: 'bold'
          },
        });
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("notification", onNotification);
    socket.on("global_notification", onGlobalNotification);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("notification", onNotification);
      socket.off("global_notification", onGlobalNotification);
    };
  }, [user]);

  const emit = (event: string, ...args: any[]) => {
    socket.emit(event, ...args);
  };

  return (
    <SocketContext.Provider value={{ isConnected, emit, socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

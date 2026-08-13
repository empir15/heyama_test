import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "./api";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_BASE_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("🟢 [Socket.IO] Connecté au serveur NestJS :", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 [Socket.IO] Déconnecté du serveur :", reason);
    });

    socket.on("connect_error", (error) => {
      console.warn("⚠️ [Socket.IO] Erreur de connexion :", error.message);
    });
  }

  return socket;
}

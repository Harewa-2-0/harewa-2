import { Server } from "socket.io";

let ioInstance = null;

/**
 * Initializes the Socket.IO server.
 * Should be called once when your HTTP server starts.
 *
 * @param {http.Server} server - The HTTP server instance
 */
export function initSocket(server) {
    if (ioInstance) {
        console.warn("⚠️ Socket.IO already initialized.");
        return ioInstance;
    }

    ioInstance = new Server(server, {
        cors: {
            origin: "*", // change to your frontend URL in production
            methods: ["GET", "POST"],
        },
    });

    ioInstance.on("connection", (socket) => {
        console.log(`✅ New socket connection: ${socket.id}`);

        // Join a user-specific room
        socket.on("join", (userId) => {
            socket.join(userId);
            console.log(`👤 User ${userId} joined their room`);
        });

        socket.on("disconnect", () => {
            console.log(`❌ Socket disconnected: ${socket.id}`);
        });
    });

    return ioInstance;
}

/**
 * Returns the initialized Socket.IO instance.
 */
export function getIO() {
    if (!ioInstance) {
        throw new Error("❌ Socket.IO not initialized. Call initSocket(server) first.");
    }
    return ioInstance;
}

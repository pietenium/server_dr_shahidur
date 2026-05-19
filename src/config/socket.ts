import type { Server as HttpServer } from "http";
import { Server as SocketServer, type Socket } from "socket.io";
import { env } from "./env";
import { logger } from "@utils/logger";
import chalk from "chalk";
import { verify } from "jsonwebtoken";
import type { JwtAccessPayload } from "@modules/auth/auth.interface";

let io: SocketServer | null = null;

// Store authenticated sockets by user ID for targeted notifications
const authenticatedSockets = new Map<string, Set<string>>();

// Extend Socket type for our custom properties
interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

/**
 * Initialize Socket.IO server
 */
export const initializeSocket = (server: HttpServer): SocketServer => {
  io = new SocketServer(server, {
    cors: {
      origin: [
        env.CLIENT_PUBLIC_URL,
        env.CLIENT_DASHBOARD_URL,
        "http://localhost:3000",
        "http://localhost:5173",
      ],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware - uses callback pattern, not promise
  io.use((socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token as string | undefined;

    if (!token) {
      return next();
    }

    try {
      const decoded = verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
      (socket as AuthenticatedSocket).userId = decoded._id;
      (socket as AuthenticatedSocket).userRole = decoded.role;
      next();
    } catch {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.userId;
    const userRole = authSocket.userRole;

    logger.info(
      `Socket connected: ${socket.id}${userId ? ` (User: ${userId}, Role: ${userRole})` : " (Public)"}`,
    );

    // Authenticated users join admin room
    if (
      userId &&
      userRole &&
      (userRole === "ADMIN" || userRole === "MODERATOR")
    ) {
      void socket.join("admin:dashboard");

      // Track authenticated socket
      if (!authenticatedSockets.has(userId)) {
        authenticatedSockets.set(userId, new Set());
      }
      authenticatedSockets.get(userId)?.add(socket.id);

      logger.info(`User ${userId} joined admin dashboard room`);
    }

    // Handle room join/leave for specific pages
    socket.on("join:appointments", () => {
      if (userId) {
        void socket.join("admin:appointments");
      }
    });

    socket.on("join:contacts", () => {
      if (userId) {
        void socket.join("admin:contacts");
      }
    });

    socket.on("leave:appointments", () => {
      void socket.leave("admin:appointments");
    });

    socket.on("leave:contacts", () => {
      void socket.leave("admin:contacts");
    });

    // Handle disconnection
    socket.on("disconnect", (reason: string) => {
      logger.info(`Socket disconnected: ${socket.id}, reason: ${reason}`);

      if (userId) {
        const userSockets = authenticatedSockets.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            authenticatedSockets.delete(userId);
          }
        }
      }
    });
  });

  logger.info(chalk.green("✓ Socket.IO initialized"));
  return io;
};

/**
 * Get the Socket.IO server instance
 */

export const getIO = (): SocketServer | null => {
  return io;
};

/**
 * Emit notification when a new appointment is created
 */
export const notifyNewAppointment = (appointment: {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  preferredDate: Date;
  preferredTime: string;
  message?: string;
  status: string;
  createdAt: Date;
}): void => {
  if (!io) {
    return;
  }

  const notification = {
    type: "NEW_APPOINTMENT" as const,
    message: `New appointment request from ${appointment.name}`,
    data: {
      id: appointment._id,
      patientName: appointment.name,
      phone: appointment.phone,
      email: appointment.email || null,
      preferredDate: appointment.preferredDate,
      preferredTime: appointment.preferredTime,
      message: appointment.message || null,
      status: appointment.status,
      createdAt: appointment.createdAt,
    },
    timestamp: new Date().toISOString(),
  };

  io.to("admin:dashboard").emit("notification", notification);
  io.to("admin:appointments").emit("new:appointment", notification);

  logger.info(
    `Socket notification sent: New appointment from ${appointment.name}`,
  );
};

/**
 * Emit notification when a new contact message is received
 */
export const notifyNewContactMessage = (contact: {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  reason: string;
  isRead: boolean;
  createdAt: Date;
}): void => {
  if (!io) {
    return;
  }

  const notification = {
    type: "NEW_CONTACT_MESSAGE" as const,
    message: `New message from ${contact.name}: ${contact.subject}`,
    data: {
      id: contact._id,
      senderName: contact.name,
      email: contact.email,
      phone: contact.phone || null,
      subject: contact.subject,
      message:
        contact.message.length > 100
          ? contact.message.substring(0, 100) + "..."
          : contact.message,
      reason: contact.reason,
      isRead: contact.isRead,
      createdAt: contact.createdAt,
    },
    timestamp: new Date().toISOString(),
  };

  io.to("admin:dashboard").emit("notification", notification);
  io.to("admin:contacts").emit("new:contact", notification);

  logger.info(
    `Socket notification sent: New contact message from ${contact.name}`,
  );
};

/**
 * Emit appointment status update
 */
export const notifyAppointmentStatusUpdate = (appointment: {
  _id: string;
  name: string;
  status: string;
}): void => {
  if (!io) {
    return;
  }

  const notification = {
    type: "APPOINTMENT_STATUS_UPDATED" as const,
    message: `Appointment for ${appointment.name} ${appointment.status.toLowerCase()}`,
    data: appointment,
    timestamp: new Date().toISOString(),
  };

  io.to("admin:dashboard").emit("notification", notification);
  io.to("admin:appointments").emit("appointment:updated", notification);
};

/**
 * Check if any admin/moderator is online
 */
export const isAnyAdminOnline = (): boolean => {
  return authenticatedSockets.size > 0;
};

/**
 * Get count of connected admin users
 */
export const getOnlineAdminCount = (): number => {
  return authenticatedSockets.size;
};

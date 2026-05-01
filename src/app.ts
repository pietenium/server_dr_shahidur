import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import chalk from "chalk";
import { corsOptions } from "@config/cors";

import { errorHandler } from "@middlewares/error.middleware";
import { ApiError } from "@utils/ApiError";
import { StatusCodes } from "http-status-codes";

// Import route modules
import authRoutes from "@modules/auth/auth.routes";
import { env } from "./config/env";
import analyticsRoutes from "@modules/analytics/analytics.routes";
import appointmentRoutes from "@modules/appointment/appointment.routes";
import articleRoutes from "@modules/article/article.routes";
import researchRoutes from "@modules/research/research.routes";
import testimonialRoutes from "@modules/testimonial/testimonial.routes";
import activityLogRoutes from "@modules/activity-log/activity-log.routes";
import appInfoRoutes from "@modules/app-info/app-info.routes";
import contactRoutes from "@modules/contact/contact.routes";
import searchRoutes from "@modules/search/search.routes";

const app = express();

// 1. Helmet with strict CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// 2. CORS
app.use(cors(corsOptions));

// 3. Compression
app.use(compression());

// 4. Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 5. Cookie parser
app.use(cookieParser());

// 6. MongoDB sanitize
app.use(mongoSanitize());

// 7. Morgan - development logging
if (env.NODE_ENV === "development") {
  app.use(
    morgan((tokens, req, res) => {
      return [
        chalk.blue(tokens.method(req, res)),
        chalk.green(tokens.status(req, res)),
        chalk.yellow(tokens.url(req, res)),
        chalk.magenta(tokens["response-time"](req, res) + " ms"),
        chalk.cyan(tokens["remote-addr"](req, res)),
      ].join(" ");
    }),
  );
}

// 8. Routes - mounted under /api/v1
 
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/articles", articleRoutes);
app.use("/api/v1/research", researchRoutes);
app.use("/api/v1/testimonials", testimonialRoutes);
app.use("/api/v1/activity-logs", activityLogRoutes);
app.use("/api/v1/app-info", appInfoRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/search", searchRoutes);

// 9. 404 handler
app.use((_req, _res, next) => {
  next(new ApiError(StatusCodes.NOT_FOUND, "Route not found"));
});

// 10. Global error handler
app.use(errorHandler);

export default app;

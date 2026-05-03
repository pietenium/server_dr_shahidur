import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import chalk from "chalk";
import hpp from "hpp";
import lusca from "lusca";
import timeout from "connect-timeout";
import { corsOptions } from "@config/cors";

import { errorHandler } from "@middlewares/error.middleware";
import { ApiError } from "@utils/ApiError";
import { StatusCodes } from "http-status-codes";

// Import routes
import routes from "./routes";
import { env } from "./config/env";

const app = express();

// 0. Request Timeout (30s)
app.use(timeout("30s"));
app.use((req, _res, next) => {
  if (!req.timedout) next();
});

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

// 7. HTTP Parameter Pollution
app.use(hpp());

// 8. Lusca - Additional security headers (satisfies CodeQL)
app.use(
  lusca({
    xframe: "SAMEORIGIN",
    p3p: "ABCDEF",
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    xssProtection: true,
    nosniff: true,
    referrerPolicy: "same-origin",
  }),
);

// 9. Morgan - development logging
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

// 10. Routes - mounted under /api/v1

app.use("/api/v1", routes);

// 11. 404 handler
app.use((_req, _res, next) => {
  next(new ApiError(StatusCodes.NOT_FOUND, "Route not found"));
});

// 12. Global error handler
app.use(errorHandler);

export default app;

# Dr. Md. Sahidur Rahman Khan — Personal Web Platform (Backend API)

> Production-grade, scalable, and secure REST API built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**. Serves two independent frontends — a public-facing Next.js website and a Vite + React admin dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Modules & API Endpoints](#modules--api-endpoints)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Authentication Flow](#authentication-flow)
- [Role & Permission System](#role--permission-system)
- [File Upload Strategy](#file-upload-strategy)
- [Notification System](#notification-system)
- [Analytics System](#analytics-system)
- [Universal Search](#universal-search)
- [Activity Logging](#activity-logging)
- [Security](#security)
- [Response Format](#response-format)
- [Email Templates](#email-templates)
- [Rate Limiting](#rate-limiting)
- [Deployment Notes](#deployment-notes)

---

## Overview

This backend API powers the personal web platform of **Dr. Md. Sahidur Rahman Khan**, Associate Professor of Orthopedic & Trauma Surgery at NITOR, Dhaka. The platform covers his professional identity as a doctor, researcher, and public figure.

The API is a single unified backend that feeds:

| Frontend        | Domain                 | Framework                 |
| --------------- | ---------------------- | ------------------------- |
| Public Website  | `www.domain.com`       | Next.js + TypeScript      |
| Admin Dashboard | `dashboard.domain.com` | Vite + React + TypeScript |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       SINGLE BACKEND API                         │
│              Node.js + Express + TypeScript + MongoDB            │
│                       api.domain.com                             │
└──────────────────────┬──────────────────────┬───────────────────┘
                       │                      │
         ┌─────────────▼──────┐   ┌───────────▼────────────┐
         │   PUBLIC FRONTEND   │   │   DASHBOARD FRONTEND   │
         │     (Next.js)       │   │    (Vite + React)      │
         │   www.domain.com    │   │  dashboard.domain.com  │
         └────────────────────┘   └────────────────────────┘
```

**Design pattern:** MVC (Model → Service → Controller → Routes)

```
Request → Route → Validator → Auth Middleware → Role Middleware
       → Activity Log Middleware → Controller → Service → Model
       → Response
```

---

## Tech Stack

### Runtime & Framework

| Package      | Purpose                                |
| ------------ | -------------------------------------- |
| `node.js`    | Runtime                                |
| `express`    | HTTP framework                         |
| `typescript` | Type safety across the entire codebase |
| `mongoose`   | MongoDB ODM                            |
| `zod`        | Environment variable schema validation |

### Auth & Security

| Package                  | Purpose                            |
| ------------------------ | ---------------------------------- |
| `jsonwebtoken`           | Access + refresh token generation  |
| `bcrypt`                 | Password hashing (salt rounds: 12) |
| `helmet`                 | HTTP security headers + CSP        |
| `cors`                   | Strict origin whitelisting         |
| `express-rate-limit`     | Per-route rate limiting            |
| `express-mongo-sanitize` | NoSQL injection prevention         |
| `xss`                    | HTML sanitization                  |
| `cookie-parser`          | HttpOnly refresh token cookies     |
| `uuid`                   | OTP + magic token generation       |

### File Handling

| Package            | Purpose                           |
| ------------------ | --------------------------------- |
| `multer`           | Multipart upload middleware       |
| `@imagekit/nodejs` | Image and PDF storage             |
| `cloudinary`       | Video storage (testimonials only) |

### Notifications

| Package                 | Purpose                        |
| ----------------------- | ------------------------------ |
| `nodemailer`            | Transactional email            |
| `whatsapp-web.js`       | WhatsApp alerts to the doctor  |
| `node-telegram-bot-api` | Telegram contact notifications |

### Utilities

| Package                | Purpose                                |
| ---------------------- | -------------------------------------- |
| `dayjs`                | Date formatting                        |
| `axios`                | HTTP calls (reCAPTCHA, geolocation)    |
| `slugify`              | URL slug generation (Bangla + English) |
| `mongoose-paginate-v2` | Cursor-based pagination                |
| `compression`          | Gzip response compression              |
| `morgan`               | HTTP request logging                   |
| `chalk@4.1.2`          | Dev console colorization               |

---

## Project Structure

```
/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── analytics/
│   │   ├── appointment/
│   │   ├── article/
│   │   ├── research/
│   │   ├── testimonial/
│   │   ├── activity-log/
│   │   ├── app-info/
│   │   ├── search/
│   │   ├── contact/
│   │   └── users/
│   ├── middlewares/
│   ├── config/
│   ├── utils/
│   ├── emails/
│   ├── constants/
│   ├── types/
│   └── app.ts
├── server.ts
├── tsconfig.json
├── .env
├── package.json
└── README.md
```

---

## Modules & API Endpoints

### Auth — `/api/v1/auth`

| Method | Endpoint           | Access    | Description                      |
| ------ | ------------------ | --------- | -------------------------------- |
| POST   | `/login`           | Public    | Email + password login           |
| POST   | `/forgot-password` | Public    | Send OTP + magic link via email  |
| POST   | `/verify-otp`      | Public    | Verify 6-digit OTP               |
| POST   | `/magic-login`     | Public    | One-click login via magic token  |
| POST   | `/reset-password`  | Public    | Set new password via magic token |
| POST   | `/refresh-token`   | Public    | Rotate refresh token from cookie |
| POST   | `/logout`          | Protected | Clear refresh token cookie       |

---

### Users — `/api/v1/users`

| Method | Endpoint             | Access     | Description                     |
| ------ | -------------------- | ---------- | ------------------------------- |
| GET    | `/me`                | Protected  | Get own profile                 |
| PATCH  | `/me`                | Protected  | Update own profile              |
| PATCH  | `/me/password`       | Protected  | Change password (with verification) |
| GET    | `/`                  | Admin only | List all users                  |
| POST   | `/invite`            | Admin only | Invite moderator via email      |
| PATCH  | `/:id/toggle-active` | Admin only | Activate/deactivate user        |
| DELETE | `/:id`               | Admin only | Delete user                     |

---

### Analytics — `/api/v1/analytics`

| Method | Endpoint              | Access    | Description                       |
| ------ | --------------------- | --------- | --------------------------------- |
| POST   | `/track`              | Public    | Track page view (fire-and-forget) |
| GET    | `/pages`              | Admin/Mod | Page views grouped by route       |
| GET    | `/locations`          | Admin/Mod | Visitors grouped by country/city  |

---

### Appointments — `/api/v1/appointments`

| Method | Endpoint      | Access    | Description                            |
| ------ | ------------- | --------- | -------------------------------------- |
| POST   | `/`           | Public    | Submit appointment (reCAPTCHA v3)      |
| GET    | `/`           | Admin/Mod | All appointments, paginated + filtered |
| GET    | `/charts`     | Admin/Mod | Chart data (daily/monthly/all-time)    |
| GET    | `/:id`        | Admin/Mod | Single appointment details             |
| PATCH  | `/:id/status` | Admin/Mod | Confirm or cancel                      |

---

### Articles — `/api/v1/articles`

| Method | Endpoint          | Access     | Description                                |
| ------ | ----------------- | ---------- | ------------------------------------------ |
| GET    | `/categories`     | Public     | All article categories                     |
| POST   | `/categories`     | Admin/Mod  | Create category                            |
| PATCH  | `/categories/:id` | Admin/Mod  | Update category                            |
| DELETE | `/categories/:id` | Admin only | Delete category                            |
| GET    | `/`               | Public     | All published articles (filter + paginate) |
| GET    | `/:slug`          | Public     | Single article + impression increment      |
| POST   | `/`               | Admin/Mod  | Create article (TipTap HTML)               |
| PATCH  | `/:id`            | Admin/Mod  | Update article                             |
| DELETE | `/:id`            | Admin only | Delete article                             |

---

### Research — `/api/v1/research`

| Method | Endpoint | Access     | Description                                |
| ------ | -------- | ---------- | ------------------------------------------ |
| GET    | `/`      | Public     | All published research (filter + paginate) |
| GET    | `/:slug` | Public     | Single research paper                      |
| POST   | `/`      | Admin/Mod  | Add research (PDF upload or DOI link)      |
| PATCH  | `/:id`   | Admin/Mod  | Update research                            |
| DELETE | `/:id`   | Admin only | Delete research                            |

---

### Testimonials — `/api/v1/testimonials`

| Method | Endpoint | Access     | Description                              |
| ------ | -------- | ---------- | ---------------------------------------- |
| GET    | `/`      | Public     | All visible testimonials                 |
| POST   | `/`      | Admin/Mod  | Create testimonial                       |
| PATCH  | `/:id`   | Admin/Mod  | Update testimonial                       |
| DELETE | `/:id`   | Admin only | Delete testimonial                       |

---

### Activity Logs — `/api/v1/activity-logs`

| Method | Endpoint    | Access    | Description                           |
| ------ | ----------- | --------- | ------------------------------------- |
| GET    | `/`         | Admin/Mod | All logs (Admin) or own logs (Mod)    |
| DELETE | `/:id`      | Admin/Mod | Delete single log                     |
| DELETE | `/bulk`     | Admin/Mod | Bulk delete by IDs                    |

---

### Contact — `/api/v1/contact`

| Method | Endpoint    | Access     | Description                        |
| ------ | ----------- | ---------- | ---------------------------------- |
| POST   | `/`         | Public     | Submit message (reCAPTCHA v3)      |
| GET    | `/`         | Admin/Mod  | All messages, paginated + filtered |
| PATCH  | `/:id/read` | Admin/Mod  | Mark message as read               |
| DELETE | `/:id`      | Admin only | Delete message                     |

---

### Universal Search — `/api/v1/search`

| Method | Endpoint            | Access | Description                             |
| ------ | ------------------- | ------ | --------------------------------------- |
| GET    | `/?q=&type=&limit=` | Public | Search articles, research, testimonials |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in every value.

```env
# SERVER
PORT=5000
NODE_ENV=development

# DATABASE
MONGO_URI=mongodb+srv://...

# REDIS
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# IMAGEKIT
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...

# CLOUDINARY
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# EMAIL
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...

# WHATSAPP
DOCTOR_WHATSAPP_NUMBER=880...
WHATSAPP_SESSION_PATH=./whatsapp-session

# TELEGRAM
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

---

## Getting Started

### Installation

```bash
# 1. Install dependencies
bun install

# 2. Set up environment variables
cp .env.example .env

# 3. Start development server
bun run dev
```

---

## Scripts

| Script      | Command                                                                 | Description                                    |
| ----------- | ----------------------------------------------------------------------- | ---------------------------------------------- |
| Development | `bun run dev`                                                           | Start with auto-restart + path alias resolution |
| Build       | `bun run build`                                                         | Compile TypeScript to `dist/`                  |
| Production  | `bun start`                                                             | Run compiled JS with path alias resolution     |
| Type Check  | `bun run type-check`                                                    | Full TypeScript check, no emit                 |

---

## Security

- **Password Hashing**: bcrypt (salt rounds: 12)
- **Token Security**: JWT Access + Refresh token rotation
- **Redis Blacklisting**: Refresh tokens invalidated on logout via Redis JTI blacklist
- **Sanitization**: `express-mongo-sanitize` + `xss` globally applied
- **Rate Limiting**: Redis-backed limits for auth, search, and tracking
- **CORS**: Strict whitelist for public and dashboard domains

---

## Email Templates

| Template                               | Trigger                | Recipient       |
| -------------------------------------- | ---------------------- | --------------- |
| `otp-email.template.ts`                | Forgot password        | Admin/Moderator |
| `magic-login.template.ts`              | Magic login link       | Admin/Moderator |
| `moderator-invite.template.ts`         | New moderator created  | New moderator   |
| `appointment-confirmation.template.ts` | Appointment submitted  | Patient         |
| `contact-confirmation.template.ts`     | Contact form submitted | Visitor         |
| `password-changed.template.ts`         | Password reset success | User            |

---

## Deployment Notes

### Production Run

```bash
bun run build
bun start
```

---

## License

Private & Confidential. All rights reserved. Proprietary codebase.

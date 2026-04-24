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
| `twilio`                | SMS (Bangladesh +880 numbers)  |
| `whatsapp-web.js`       | WhatsApp alerts to the doctor  |
| `node-telegram-bot-api` | Telegram contact notifications |

### Utilities

| Package                | Purpose                                |
| ---------------------- | -------------------------------------- |
| `dayjs`                | Date formatting                        |
| `axios`                | HTTP calls (reCAPTCHA, geolocation)    |
| `slugify`              | URL slug generation (Bangla + English) |
| `mongoose-paginate-v2` | Cursor-based pagination                |
| `socket.io`            | Real-time activity log feed            |
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
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.validator.ts
│   │   │   ├── auth.model.ts
│   │   │   └── auth.interface.ts
│   │   ├── analytics/
│   │   │   ├── analytics.routes.ts
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── analytics.validator.ts
│   │   │   ├── analytics.model.ts
│   │   │   └── analytics.interface.ts
│   │   ├── appointment/
│   │   │   ├── appointment.routes.ts
│   │   │   ├── appointment.controller.ts
│   │   │   ├── appointment.service.ts
│   │   │   ├── appointment.validator.ts
│   │   │   ├── appointment.model.ts
│   │   │   └── appointment.interface.ts
│   │   ├── article/
│   │   │   ├── article.routes.ts
│   │   │   ├── article.controller.ts
│   │   │   ├── article.service.ts
│   │   │   ├── article.validator.ts
│   │   │   ├── article.model.ts
│   │   │   ├── article-category.model.ts
│   │   │   └── article.interface.ts
│   │   ├── research/
│   │   │   ├── research.routes.ts
│   │   │   ├── research.controller.ts
│   │   │   ├── research.service.ts
│   │   │   ├── research.validator.ts
│   │   │   ├── research.model.ts
│   │   │   └── research.interface.ts
│   │   ├── testimonial/
│   │   │   ├── testimonial.routes.ts
│   │   │   ├── testimonial.controller.ts
│   │   │   ├── testimonial.service.ts
│   │   │   ├── testimonial.validator.ts
│   │   │   ├── testimonial.model.ts
│   │   │   └── testimonial.interface.ts
│   │   ├── activity-log/
│   │   │   ├── activity-log.routes.ts
│   │   │   ├── activity-log.controller.ts
│   │   │   ├── activity-log.service.ts
│   │   │   ├── activity-log.model.ts
│   │   │   └── activity-log.interface.ts
│   │   ├── app-info/
│   │   │   ├── app-info.routes.ts
│   │   │   ├── app-info.controller.ts
│   │   │   ├── app-info.service.ts
│   │   │   ├── app-info.validator.ts
│   │   │   ├── app-info.model.ts
│   │   │   └── app-info.interface.ts
│   │   ├── search/
│   │   │   ├── search.routes.ts
│   │   │   ├── search.controller.ts
│   │   │   ├── search.service.ts
│   │   │   ├── search.validator.ts
│   │   │   └── search.interface.ts
│   │   └── contact/
│   │       ├── contact.routes.ts
│   │       ├── contact.controller.ts
│   │       ├── contact.service.ts
│   │       ├── contact.validator.ts
│   │       ├── contact.model.ts
│   │       └── contact.interface.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── activity-log.middleware.ts
│   │   ├── recaptcha.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── error.middleware.ts
│   ├── config/
│   │   ├── db.ts
│   │   ├── env.ts
│   │   ├── imagekit.ts
│   │   ├── cloudinary.ts
│   │   ├── nodemailer.ts
│   │   └── cors.ts
│   ├── utils/
│   │   ├── ApiResponse.ts
│   │   ├── ApiError.ts
│   │   ├── asyncHandler.ts
│   │   ├── slugify.ts
│   │   ├── generateOTP.ts
│   │   ├── generateToken.ts
│   │   ├── getGeoLocation.ts
│   │   ├── sanitizeHtml.ts
│   │   ├── sendSMS.ts
│   │   ├── sendWhatsApp.ts
│   │   ├── sendTelegram.ts
│   │   └── validateDOI.ts
│   ├── emails/
│   │   ├── templates/
│   │   │   ├── otp-email.template.ts
│   │   │   ├── magic-login.template.ts
│   │   │   ├── moderator-invite.template.ts
│   │   │   ├── appointment-confirmation.template.ts
│   │   │   └── contact-confirmation.template.ts
│   │   └── sendEmail.ts
│   ├── constants/
│   │   ├── roles.constant.ts
│   │   ├── status.constant.ts
│   │   └── messages.constant.ts
│   ├── types/
│   │   ├── express.d.ts
│   │   ├── global.types.ts
│   │   └── whatsapp-web.js.d.ts
│   └── app.ts
├── server.ts
├── tsconfig.json
├── .env
├── .env.example
├── .gitignore
└── package.json
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

### Analytics — `/api/v1/analytics`

| Method | Endpoint              | Access    | Description                       |
| ------ | --------------------- | --------- | --------------------------------- |
| POST   | `/track`              | Public    | Track page view (fire-and-forget) |
| GET    | `/pages`              | Admin/Mod | Page views grouped by route       |
| GET    | `/locations`          | Admin/Mod | Visitors grouped by country/city  |
| GET    | `/appointments/daily` | Admin/Mod | Daily appointment submissions     |
| GET    | `/articles`           | Admin/Mod | Article impressions, top 5        |

---

### Appointments — `/api/v1/appointments`

| Method | Endpoint      | Access    | Description                            |
| ------ | ------------- | --------- | -------------------------------------- |
| POST   | `/`           | Public    | Submit appointment (reCAPTCHA v3)      |
| GET    | `/`           | Admin/Mod | All appointments, paginated + filtered |
| GET    | `/charts`     | Admin/Mod | Chart data (daily/monthly/all-time)    |
| GET    | `/:id`        | Admin/Mod | Single appointment + SMS log           |
| PATCH  | `/:id/status` | Admin/Mod | Confirm or cancel                      |
| POST   | `/:id/sms`    | Admin/Mod | Send custom SMS to patient             |

> On new appointment: sends confirmation email to patient + WhatsApp alert to doctor (non-blocking).

---

### Articles — `/api/v1/articles`

| Method | Endpoint          | Access     | Description                                |
| ------ | ----------------- | ---------- | ------------------------------------------ |
| GET    | `/categories`     | Public     | All article categories                     |
| POST   | `/categories`     | Admin/Mod  | Create category                            |
| PATCH  | `/categories/:id` | Admin/Mod  | Update category                            |
| DELETE | `/categories/:id` | Admin only | Delete category (blocks if in use)         |
| GET    | `/`               | Public     | All published articles (filter + paginate) |
| GET    | `/:slug`          | Public     | Single article + impression increment      |
| GET    | `/:slug/single`   | Admin/Mod  | Single article including drafts            |
| POST   | `/`               | Admin/Mod  | Create article (TipTap HTML)               |
| PATCH  | `/:id`            | Admin/Mod  | Update article                             |
| DELETE | `/:id`            | Admin only | Delete article                             |

> Article types: `medical` or `political`. Content is sanitized via `sanitizeHtml.ts` before saving.

---

### Research — `/api/v1/research`

| Method | Endpoint | Access     | Description                                |
| ------ | -------- | ---------- | ------------------------------------------ |
| GET    | `/`      | Public     | All published research (filter + paginate) |
| GET    | `/:slug` | Public     | Single research paper                      |
| POST   | `/`      | Admin/Mod  | Add research (PDF upload or DOI link)      |
| PATCH  | `/:id`   | Admin/Mod  | Update research                            |
| DELETE | `/:id`   | Admin only | Delete research + remove PDF from ImageKit |

> Upload modes: `pdf` (uploaded to ImageKit) or `doi` (validated DOI link). Mutually exclusive.

---

### Testimonials — `/api/v1/testimonials`

| Method | Endpoint | Access     | Description                              |
| ------ | -------- | ---------- | ---------------------------------------- |
| GET    | `/`      | Public     | All visible testimonials                 |
| GET    | `/:id`   | Public     | Single testimonial with video            |
| POST   | `/`      | Admin/Mod  | Create (image required, video optional)  |
| PATCH  | `/:id`   | Admin/Mod  | Update + toggle visibility               |
| DELETE | `/:id`   | Admin only | Delete + remove from ImageKit/Cloudinary |

> Images stored on ImageKit. Videos stored on Cloudinary.

---

### Activity Logs — `/api/v1/logs`

| Method | Endpoint    | Access    | Description                           |
| ------ | ----------- | --------- | ------------------------------------- |
| GET    | `/`         | Admin/Mod | All logs (Admin) or own logs (Mod)    |
| DELETE | `/:id`      | Admin/Mod | Delete single log (own only for Mod)  |
| DELETE | `/selected` | Admin/Mod | Bulk delete by IDs (own only for Mod) |
| DELETE | `/all`      | Admin/Mod | Delete all own logs                   |

---

### App Info (SEO) — `/api/v1/app-info`

| Method | Endpoint | Access     | Description                    |
| ------ | -------- | ---------- | ------------------------------ |
| GET    | `/`      | Public     | Global SEO metadata            |
| PATCH  | `/`      | Admin only | Update SEO metadata + OG image |

---

### Contact — `/api/v1/contact`

| Method | Endpoint    | Access     | Description                        |
| ------ | ----------- | ---------- | ---------------------------------- |
| POST   | `/`         | Public     | Submit message (reCAPTCHA v3)      |
| GET    | `/`         | Admin/Mod  | All messages, paginated + filtered |
| PATCH  | `/:id/read` | Admin/Mod  | Mark message as read               |
| DELETE | `/:id`      | Admin only | Delete message                     |

> On new contact message: sends confirmation email to sender + Telegram notification to doctor (non-blocking).

---

### Universal Search — `/api/v1/search`

| Method | Endpoint            | Access | Description                             |
| ------ | ------------------- | ------ | --------------------------------------- |
| GET    | `/?q=&type=&limit=` | Public | Search articles, research, testimonials |

---

### Users — `/api/v1/users`

| Method | Endpoint             | Access     | Description                     |
| ------ | -------------------- | ---------- | ------------------------------- |
| GET    | `/`                  | Admin only | All users (admins + moderators) |
| POST   | `/moderator`         | Admin only | Create new moderator            |
| PATCH  | `/:id/toggle-active` | Admin only | Activate or deactivate user     |
| DELETE | `/:id`               | Admin only | Delete user                     |
| GET    | `/me`                | Admin/Mod  | Own profile                     |
| PATCH  | `/me/password`       | Admin/Mod  | Change own password             |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in every value. The app crashes at startup if any variable is missing or invalid.

```env
# ─── SERVER ──────────────────────────────────────────
PORT=5000
NODE_ENV=development                    # development | production | test

# ─── DATABASE ────────────────────────────────────────
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/dr-sahidur

# ─── JWT ─────────────────────────────────────────────
JWT_ACCESS_SECRET=your_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ─── CORS ─────────────────────────────────────────────
CLIENT_PUBLIC_URL=https://www.domain.com
CLIENT_DASHBOARD_URL=https://dashboard.domain.com

# ─── IMAGEKIT ─────────────────────────────────────────
IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/yourid

# ─── CLOUDINARY ───────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─── EMAIL (SMTP) ──────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
SMTP_FROM_NAME=Dr. Sahidur Rahman Khan
SMTP_FROM_EMAIL=no-reply@domain.com

# ─── GOOGLE RECAPTCHA V3 ───────────────────────────────
RECAPTCHA_V3_SECRET=your_recaptcha_v3_secret_key

# ─── SMS (TWILIO) ──────────────────────────────────────
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
DOCTOR_PHONE_NUMBER=+880xxxxxxxxxx

# ─── WHATSAPP ──────────────────────────────────────────
DOCTOR_WHATSAPP_NUMBER=880xxxxxxxxxx   # No + prefix, no spaces
WHATSAPP_SESSION_PATH=./whatsapp-session

# ─── TELEGRAM ─────────────────────────────────────────
TELEGRAM_BOT_TOKEN=xxxxxxxxxx:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_CHAT_ID=xxxxxxxxxx

# ─── ADMIN SEED ───────────────────────────────────────
ADMIN_SEED_EMAIL=admin@domain.com
ADMIN_SEED_PASSWORD=StrongPassword@123
```

---

## Getting Started

### Prerequisites

- Node.js `v18+`
- MongoDB (Atlas or local)
- A WhatsApp account for the doctor (for WhatsApp notifications)
- A Telegram bot token (from [@BotFather](https://t.me/BotFather))
- ImageKit account
- Cloudinary account
- Twilio account
- Google reCAPTCHA v3 site + secret keys

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/dr-sahidur-backend.git
cd dr-sahidur-backend

# 2. Install production dependencies
npm install express mongoose dotenv cors helmet compression morgan \
  jsonwebtoken bcrypt express-rate-limit express-mongo-sanitize xss \
  uuid cookie-parser express-validator multer @imagekit/nodejs cloudinary \
  nodemailer dayjs mongoose-paginate-v2 socket.io twilio axios slugify \
  zod whatsapp-web.js qrcode-terminal node-telegram-bot-api

# 3. Install chalk at v4 (CommonJS compatible)
npm install chalk@4.1.2

# 4. Install dev dependencies
npm install -D typescript ts-node ts-node-dev tsconfig-paths @types/node \
  @types/express @types/cors @types/compression @types/morgan \
  @types/jsonwebtoken @types/bcrypt @types/express-mongo-sanitize \
  @types/xss @types/uuid @types/cookie-parser @types/multer \
  @types/nodemailer @types/qrcode-terminal @types/node-telegram-bot-api \
  @types/slugify nodemon

# 5. Set up environment variables
cp .env.example .env
# Fill in all values in .env

# 6. Start development server
npm run dev
```

### First-Time WhatsApp Setup

On the very first run, the terminal will display a QR code:

```
──────────────────────────────────────────────
  WHATSAPP: Scan this QR code to authenticate.
  This is only required once.
──────────────────────────────────────────────
[QR CODE APPEARS HERE]
```

Open WhatsApp on the doctor's phone → Linked Devices → Link a Device → scan the QR code. The session is saved to `WHATSAPP_SESSION_PATH` and future restarts will not require re-scanning.

---

## Scripts

| Script      | Command              | Description                                    |
| ----------- | -------------------- | ---------------------------------------------- |
| Development | `npm run dev`        | Start with ts-node-dev, auto-restart on change |
| Build       | `npm run build`      | Compile TypeScript to `dist/`                  |
| Production  | `npm start`          | Run compiled JS from `dist/`                   |
| Type Check  | `npm run type-check` | Full TypeScript check, no emit                 |

---

## Authentication Flow

### Standard Login

```
POST /api/v1/auth/login
  → Validate email + password
  → bcrypt.compare()
  → Issue access token (15m) + refresh token (7d)
  → Refresh token → HttpOnly Secure cookie
  → Access token → response body
```

### Forgot Password (Custom Hybrid Flow)

```
POST /api/v1/auth/forgot-password
  → Generate 6-digit OTP (crypto.randomInt)
  → Generate UUID magic token
  → Hash both → store in DB with 10min expiry
  → Send email containing:
      • OTP code (for manual verification)
      • Magic login button (direct dashboard access)

POST /api/v1/auth/verify-otp
  → Compare hashed OTP
  → Return { verified: true, magicToken }
  → Frontend shows two options:
      ① Magic Login (no password needed)
      ② Reset Password

POST /api/v1/auth/magic-login   ← Option ①
  → Validate magic token
  → Issue full auth tokens
  → Clear OTP + magic token

POST /api/v1/auth/reset-password  ← Option ②
  → Validate magic token as proof
  → Hash + save new password
  → Clear OTP + magic token
  → Send password-changed email
```

### Token Refresh

```
POST /api/v1/auth/refresh-token
  → Read refresh token from HttpOnly cookie
  → Verify + find user
  → Issue new access token + new refresh token (rotation)
  → Update cookie
```

---

## Role & Permission System

Two roles exist. There is no public registration — moderators are created only by the Admin.

| Action                                  | ADMIN | MODERATOR     |
| --------------------------------------- | ----- | ------------- |
| All GET endpoints                       | ✅    | ✅            |
| Create articles, research, testimonials | ✅    | ✅            |
| Update articles, research, testimonials | ✅    | ✅            |
| Confirm/cancel appointments             | ✅    | ✅            |
| Send SMS to patients                    | ✅    | ✅            |
| View all activity logs                  | ✅    | ❌ (own only) |
| Delete articles, research, testimonials | ✅    | ❌            |
| Delete appointments/contacts            | ✅    | ❌            |
| Update app SEO info                     | ✅    | ❌            |
| Create/delete moderators                | ✅    | ❌            |
| Toggle user active status               | ✅    | ❌            |
| View other moderators' logs             | ✅    | ❌            |

---

## File Upload Strategy

| Asset Type              | Storage    | Package            | Max Size |
| ----------------------- | ---------- | ------------------ | -------- |
| Article/Research images | ImageKit   | `@imagekit/nodejs` | 5 MB     |
| Research PDFs           | ImageKit   | `@imagekit/nodejs` | 20 MB    |
| Testimonial images      | ImageKit   | `@imagekit/nodejs` | 5 MB     |
| Testimonial videos      | Cloudinary | `cloudinary`       | 100 MB   |
| OG / SEO images         | ImageKit   | `@imagekit/nodejs` | 5 MB     |

All uploads are processed in memory (`multer.memoryStorage()`). MIME type is validated in the `fileFilter` — file extension alone is never trusted. When a resource is deleted, its associated asset is removed from ImageKit or Cloudinary before the database document is deleted.

---

## Notification System

All notifications are **non-blocking** — the HTTP response is returned to the user before any notification is sent. Notifications use fire-and-forget or `Promise.allSettled`. A notification failure never fails the API response.

### Appointment Submitted

```
Patient submits appointment form
  ├── [Sync]  Save to MongoDB
  ├── [Sync]  Return 201 success to patient
  └── [Async, non-blocking]
        ├── Email → patient (confirmation)
        └── WhatsApp → doctor (full appointment details)
```

### Contact Message Submitted

```
Visitor submits contact form
  ├── [Sync]  Save to MongoDB
  ├── [Sync]  Return 200 success to visitor
  └── [Async, non-blocking]
        ├── Email → visitor (acknowledgment)
        └── Telegram → doctor (full message details)
```

### WhatsApp Message Format (sent to doctor)

```
🗓 *New Appointment Request*

👤 *Patient:* John Doe
📞 *Phone:* 01712345678
📧 *Email:* john@email.com
📅 *Preferred Date:* 15 May 2025
⏰ *Preferred Time:* 10:00 AM
💬 *Message:* Knee pain for 3 months
📍 *Location:* Dhaka, Bangladesh
🕐 *Submitted:* 24 Apr 2025, 09:32 AM

Reply with CONFIRM or CANCEL via dashboard.
```

### Telegram Message Format (sent to doctor)

```
📩 New Contact Message

👤 Name: Jane Doe
📧 Email: jane@email.com
📞 Phone: 01798765432
🏷 Subject: Seeking consultation
📋 Reason: medical-inquiry
💬 Message:
I have been experiencing lower back pain...

📍 Location: Chittagong, Bangladesh
🕐 Received: 24 Apr 2025, 11:15 AM
```

---

## Analytics System

Page views are tracked silently on every public page load. The tracking endpoint is optimized to return immediately without blocking.

```
Public page loads
  → POST /api/v1/analytics/track?page=homepage&sessionId=uuid
  → Returns 200 immediately
  → Geolocation resolved async (ipwho.is)
  → Document saved in background
```

**Dashboard analytics available:**

- Page views: daily / weekly / monthly / all-time breakdown per route
- Location analytics: unique visitors by country and city
- Appointment activity: daily submission count + location breakdown
- Article performance: impressions per article, top 5 ranked

Guest users are identified by a cookie-based UUID (`sessionId`) set on the public frontend after cookie consent is accepted.

---

## Universal Search

The navbar search on the public website calls a single endpoint that queries three collections in parallel.

```
GET /api/v1/search?q=knee&type=article&limit=5
```

| Parameter | Required | Type                                     | Description                                |
| --------- | -------- | ---------------------------------------- | ------------------------------------------ |
| `q`       | Yes      | string                                   | Search query, min 2 chars                  |
| `type`    | No       | `article` \| `research` \| `testimonial` | Filter to one collection                   |
| `limit`   | No       | number                                   | Results per collection (max 20, default 5) |

**Response shape:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Search completed",
  "data": {
    "query": "knee",
    "totalResults": 11,
    "results": {
      "articles": [{ "resultType": "article", "title": "...", "slug": "..." }],
      "research": [{ "resultType": "research", "title": "...", "slug": "..." }],
      "testimonials": [{ "resultType": "testimonial", "patientName": "..." }]
    }
  }
}
```

All three queries run via `Promise.all` — total response time equals the slowest single query, not the sum of all three. Rate limited at 30 requests/minute per IP.

---

## Activity Logging

Every mutating operation on a protected route automatically logs an activity entry via `activity-log.middleware.ts`. Logging is fire-and-forget — it never delays the response.

**Each log entry records:**

| Field       | Description                                                      |
| ----------- | ---------------------------------------------------------------- |
| `user`      | Reference to the user who acted                                  |
| `userName`  | Denormalized name (for display without join)                     |
| `userRole`  | Denormalized role                                                |
| `action`    | Human-readable sentence: `"Created article: Knee Surgery Guide"` |
| `module`    | Module name: `article`, `appointment`, `auth`, etc.              |
| `targetId`  | ID of the affected document                                      |
| `ipAddress` | Request IP                                                       |
| `location`  | Country + city from geolocation                                  |
| `timestamp` | Exact datetime                                                   |

**Access rules:**

- Admin can view all logs, search by moderator, filter by module and date range
- Moderator can view only their own logs
- Both can delete their own logs (single, selected, or all)

---

## Security

| Layer               | Implementation                                                   |
| ------------------- | ---------------------------------------------------------------- |
| Password hashing    | bcrypt, salt rounds: 12                                          |
| OTP storage         | SHA-256 hashed before saving, raw sent to user                   |
| Magic token storage | SHA-256 hashed before saving, raw sent via email                 |
| Access tokens       | JWT, 15-minute expiry                                            |
| Refresh tokens      | JWT, 7-day expiry, HttpOnly + Secure + SameSite=Strict cookie    |
| HTTP headers        | `helmet()` with strict CSP                                       |
| NoSQL injection     | `express-mongo-sanitize` applied globally                        |
| XSS                 | `xss` applied globally + `sanitizeHtml.ts` on TipTap content     |
| CORS                | Strict whitelist — only two frontend origins                     |
| Rate limiting       | Per-route, per-IP (see Rate Limiting section)                    |
| File uploads        | MIME type validated in fileFilter — extension never trusted      |
| Error responses     | Stack traces hidden in production                                |
| Role enforcement    | Server-side on every protected route — never trust frontend      |
| reCAPTCHA           | v3 server-side score validation (threshold: 0.5) on public forms |

---

## Response Format

Every API response follows one of two structures — no exceptions.

**Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Articles fetched successfully",
  "data": {}
}
```

**Error:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Email is required" }]
}
```

**Paginated list:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Appointments fetched successfully",
  "data": {
    "results": [],
    "pagination": {
      "totalDocs": 120,
      "totalPages": 12,
      "currentPage": 1,
      "limit": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## Email Templates

All templates are typed TypeScript functions returning inline-CSS HTML. Compatible with all major email clients.

| Template                               | Trigger                | Recipient       |
| -------------------------------------- | ---------------------- | --------------- |
| `otp-email.template.ts`                | Forgot password        | Admin/Moderator |
| `magic-login.template.ts`              | Magic login link       | Admin/Moderator |
| `moderator-invite.template.ts`         | New moderator created  | New moderator   |
| `appointment-confirmation.template.ts` | Appointment submitted  | Patient         |
| `contact-confirmation.template.ts`     | Contact form submitted | Visitor         |

Branding color: `#1a6b4a` (medical green). Every template includes a header with the doctor's name, body content, and a footer with contact info + disclaimer.

---

## Rate Limiting

| Route Group               | Limit        | Window                |
| ------------------------- | ------------ | --------------------- |
| `/api/v1/auth/*`          | 10 requests  | per 15 minutes per IP |
| `/api/v1/analytics/track` | 60 requests  | per 1 minute per IP   |
| `/api/v1/search`          | 30 requests  | per 1 minute per IP   |
| All other routes          | 100 requests | per 15 minutes per IP |

---

## Deployment Notes

### Production Build

```bash
npm run build       # Compile TypeScript → dist/
npm start           # Run node dist/server.js
```

### WhatsApp Session

On first production deployment, the QR code will appear in server logs (stdout). The doctor or developer must scan it once. The session is saved to `WHATSAPP_SESSION_PATH`. If the session expires, delete the session folder and restart to trigger a fresh QR scan.

```bash
# Reset WhatsApp session if needed
rm -rf ./whatsapp-session
npm start
```

### Environment Checklist Before Going Live

- [ ] `NODE_ENV=production` is set
- [ ] All `.env` values are filled — no placeholder values remain
- [ ] MongoDB Atlas IP whitelist includes the server IP
- [ ] CORS origins match exact production domain URLs (no trailing slashes)
- [ ] reCAPTCHA site key on the frontend matches the secret key in the backend
- [ ] Telegram bot has been started by the doctor (send `/start` to the bot)
- [ ] WhatsApp QR has been scanned and session is persisted
- [ ] `dist/` folder is excluded from `.gitignore` verification on the server
- [ ] Admin seed credentials are strong and stored securely

### Recommended Process Manager

```bash
npm install -g pm2

pm2 start dist/server.js --name "dr-sahidur-api"
pm2 save
pm2 startup
```

---

## Author

Backend architecture designed and specified for the personal web platform of **Dr. Md. Sahidur Rahman Khan** — Associate Professor, Department of Orthopedic & Trauma Surgery, National Institute of Traumatology & Orthopedic Rehabilitation (NITOR), Dhaka, Bangladesh.

---

## License

Private & Confidential. All rights reserved. This codebase is proprietary and not licensed for public use or redistribution.

import { Router } from "express";
import authRoutes from "@modules/auth/auth.routes";
import analyticsRoutes from "@modules/analytics/analytics.routes";
import appointmentRoutes from "@modules/appointment/appointment.routes";
import articleRoutes from "@modules/article/article.routes";
import researchRoutes from "@modules/research/research.routes";
import testimonialRoutes from "@modules/testimonial/testimonial.routes";
import activityLogRoutes from "@modules/activity-log/activity-log.routes";
import appInfoRoutes from "@modules/app-info/app-info.routes";
import contactRoutes from "@modules/contact/contact.routes";
import searchRoutes from "@modules/search/search.routes";
import usersRoutes from "@modules/users/users.routes";

const router = Router();

const moduleRoutes = [
  { path: "/auth", route: authRoutes },
  { path: "/analytics", route: analyticsRoutes },
  { path: "/appointments", route: appointmentRoutes },
  { path: "/articles", route: articleRoutes },
  { path: "/research", route: researchRoutes },
  { path: "/testimonials", route: testimonialRoutes },
  { path: "/activity-logs", route: activityLogRoutes },
  { path: "/app-info", route: appInfoRoutes },
  { path: "/contact", route: contactRoutes },
  { path: "/search", route: searchRoutes },
  { path: "/users", route: usersRoutes },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;

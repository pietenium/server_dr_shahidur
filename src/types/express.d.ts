import { AuthenticatedUser } from "./global.types";

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUser;
    files?: {
      [fieldname: string]: Express.Multer.File[];
    } & { file?: Express.Multer.File[] };
  }
}
export {};

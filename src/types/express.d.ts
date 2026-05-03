declare namespace Express {
  interface AuthenticatedUser {
    _id: string;
    email?: string;
    name?: string;
    role: "ADMIN" | "MODERATOR";
  }

  interface Request {
    user?: AuthenticatedUser;
    file?: Express.Multer.File;
    files?:
      | {
          [fieldname: string]: Express.Multer.File[];
        }
      | Express.Multer.File[];
  }
}

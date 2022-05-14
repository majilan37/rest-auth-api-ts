import mongoose from "mongoose";

export interface UserType extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

export interface SessionType extends mongoose.Document {
  user: UserType["_id"];
  valid: boolean;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

declare module "express-serve-static-core" {
  interface Request {
    user: UserType & {
      session: string;
      [key: string]: any;
    };
  }
}

import { Router } from "express";
import {
  createSession,
  getUserSessions,
  invalidateSession,
  registerUser,
} from "../controllers/users";
import validate from "../middleware/validateRequest";
import { sessionSchema, userSchema } from "../schemas/user";

const router = Router();

// POST ? register user
router.post("/register", validate(userSchema), registerUser);

// POST ? login user
router.post("/login", validate(sessionSchema), createSession);

// GET ? get user sessions
router.get("/sessions", getUserSessions);

// DELETE ? logout user
router.delete("/logout", invalidateSession);

export default router;

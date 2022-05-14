import { Request, Response } from "express";
import User from "../models/User";
import { omit } from "lodash";
import { SessionType, UserType } from "../types";
import Session from "../models/Session";
import jwt from "jsonwebtoken";
import { LeanDocument } from "mongoose";

// ? register user
export async function registerUser(req: Request, res: Response) {
  try {
    const user = await User.create(req.body);

    return res.send(omit(user.toJSON(), "password"));
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
}

// ? login user
export async function createSession(req: Request, res: Response) {
  // * validate email and password
  const { email, password }: { email: UserType["email"]; password: string } =
    req.body;

  try {
    // * create a session
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).send("Invalid password");

    const session = await Session.create({
      user: user._id,
      userAgent: req.headers["user-agent"],
    });
    // * create access token
    const accessToken = createAccessToken(user, session);

    // * create refresh token
    const refreshToken = jwt.sign(
      { session },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({ accessToken, refreshToken });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

// ? logout user
export async function invalidateSession(req: Request, res: Response) {
  const { session } = req.user;
  if (!session) return res.status(404).send("Session not found");

  await Session.updateOne({ _id: session }, { valid: false });

  res.sendStatus(200);
}

// ? get user sessions
export async function getUserSessions(req: Request, res: Response) {
  const { session, _id } = req.user;
  if (!session) return res.status(404).send("Session not found");

  const sessions = await Session.find({ user: _id }).lean();
  return res.status(200).json(sessions);
}

// create access token
function createAccessToken(
  user: Omit<UserType, "password"> | LeanDocument<Omit<UserType, "password">>,
  session:
    | Omit<SessionType, "password">
    | LeanDocument<Omit<SessionType, "password">>
) {
  const accessToken = jwt.sign(
    { ...user, session: session._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "15m" }
  );

  return accessToken;
}

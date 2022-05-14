import { NextFunction, Request, Response } from "express";
import { get } from "lodash";
import jwt from "jsonwebtoken";
import { UserType } from "../types";
import Session from "../models/Session";
import User from "../models/User";

export async function deserializedUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const accessToken = get(req, "headers.authorization", "").replace(
    /^Bearer\s/,
    ""
  );
  const refreshToken = get(req, "headers.x-refresh");

  if (!accessToken) return next();

  let result;
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string);

    if (decoded) {
      req.user = {
        ...(decoded as any)._doc,
        session: (decoded as any).session,
      } as UserType & { session: string };
    }
    result = {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (err) {
    console.log(err);
    result = {
      valid: false,
      expired: (err as any).message === "jwt expired",
      decoded: null,
    };
  }

  if (result.expired && refreshToken) {
    const newAccessToken = await reIssueAccessToken({ refreshToken });

    if (newAccessToken) {
      res.setHeader("x-access-token", newAccessToken);
      const decoded = jwt.verify(
        newAccessToken,
        process.env.JWT_SECRET as string
      );
      req.user = {
        ...(decoded as any)._doc,
        session: (decoded as any).session,
      } as UserType & { session: string };
    }
  }
  return next();
}

const reIssueAccessToken = async ({
  refreshToken,
}: {
  refreshToken: string;
}) => {
  // * decode the refresh token
  const { _doc } = jwt.verify(
    refreshToken,
    process.env.JWT_SECRET as string
  ) as any;
  if (!_doc || !get(_doc, "_id")) {
    console.log("connot decode refresh token");
    return;
  }

  // * get the session
  const session = await Session.findById(get(_doc, "_id"));

  // * check if the session is valid
  if (!session || !session.valid) {
    console.log("session is not valid or not found");
  }

  const user = await User.findOne({ _id: session?.user }).lean();

  if (!user) {
    console.log("user not found");
    return;
  }

  const accessToken = jwt.sign(
    { ...user, session: session?._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "15m" }
  );

  return accessToken;
};

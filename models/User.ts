import mongoose from "mongoose";
import { UserType } from "../types";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema<UserType>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const user = this as UserType;
  //  *  only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) {
    return next();
  }

  //  *  random additional data
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = bcrypt.hashSync(user.password, salt);

  //  *  replace the password with the hashed one
  user.password = hashedPassword;

  return next();
});

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  const user = this as UserType;
  return await bcrypt.compare(password, user.password);
};

export default mongoose.model<UserType>("User", userSchema);

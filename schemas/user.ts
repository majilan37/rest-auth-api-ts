import { object, ref, string } from "yup";

export const userSchema = object({
  body: object({
    name: string().required("Name is required"),
    email: string().required("Email is required").email("Email is invalid"),
    password: string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters")
      .matches(
        /^[a-zA-Z0-9_.-]*$/,
        "Password can only contain letters, numbers, underscores, dashes, and dots"
      ),
    confirmPassword: string().oneOf(
      [ref("password"), null],
      "Passwords must match"
    ),
  }),
});

export const sessionSchema = object({
  body: object({
    password: string().required("Password is required"),
    email: string().required("Email is required"),
  }),
});

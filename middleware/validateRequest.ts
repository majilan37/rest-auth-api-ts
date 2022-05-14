import { NextFunction, Request, Response } from "express";
import { AnySchema } from "yup";

export default function validate(schema: AnySchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
    } catch (err) {
      console.log(err);

      return res.status(400).json((err as any).errors[0]);
    }
  };
}

import { Request, Response, NextFunction } from 'express';

const EDU_REGEX = /\.(edu|edu\.tr)$/i;

export function eduEmail(req: Request, res: Response, next: NextFunction): void {
  const { email } = req.body as { email?: string };
  if (!email || !EDU_REGEX.test(email)) {
    res.status(400).json({ error: 'Only .edu or .edu.tr institutional emails are allowed' });
    return;
  }
  next();
}

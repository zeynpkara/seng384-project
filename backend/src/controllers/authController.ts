import { Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { auditService } from '../services/auditService';
import { sendVerificationEmail } from '../services/emailService';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['HEALTHCARE', 'ENGINEER'], { message: 'Role must be HEALTHCARE or ENGINEER' }),
  name: z.string().min(2, 'Name is required'),
  institution: z.string().min(2, 'Institution is required'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

function getIp(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
}

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { email, password, role, name, institution } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: { email, passwordHash, role, name, institution, verificationToken, isVerified: false },
    });

    auditService.log({ action: 'USER_REGISTERED', userId: user.id, ipAddress: getIp(req) });

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: 'Verification email sent. Check your inbox.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const { token } = req.params;

  try {
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) {
      res.status(400).json({ error: 'Invalid or expired verification token' });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null },
    });

    auditService.log({ action: 'EMAIL_VERIFIED', userId: user.id });

    res.json({ message: 'Email verified. You can now login.' });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ error: 'Please verify your email before logging in' });
      return;
    }

    if (user.isSuspended) {
      res.status(403).json({ error: 'Your account has been suspended. Contact support.' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions,
    );

    auditService.log({ action: 'USER_LOGIN', userId: user.id, ipAddress: getIp(req) });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        institution: user.institution,
        ndaAcceptedAt: user.ndaAcceptedAt,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  if (req.user) {
    auditService.log({ action: 'USER_LOGOUT', userId: req.user.id, ipAddress: getIp(req) });
  }
  res.json({ message: 'Logged out successfully' });
}

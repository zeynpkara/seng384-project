import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { auditService } from '../services/auditService';

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, role: true, name: true, institution: true, isVerified: true, ndaAcceptedAt: true, createdAt: true },
    });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const { name, institution } = req.body as { name?: string; institution?: string };

  try {
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name && { name }),
        ...(institution && { institution }),
      },
      select: { id: true, email: true, role: true, name: true, institution: true },
    });
    res.json(updated);
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function exportData(req: Request, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, institution: true, role: true, createdAt: true, ndaAcceptedAt: true },
    });

    const posts = await prisma.post.findMany({
      where: { ownerId: req.user!.id },
      select: { id: true, title: true, domain: true, status: true, createdAt: true },
    });

    const meetingRequests = await prisma.meetingRequest.findMany({
      where: { OR: [{ requesterId: req.user!.id }, { postOwnerId: req.user!.id }] },
      select: { id: true, status: true, ndaAccepted: true, confirmedSlot: true, createdAt: true },
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    auditService.log({ action: 'DATA_EXPORTED', userId: req.user!.id });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="healthai-data-export-${dateStr}.json"`);
    res.json({ exportedAt: new Date().toISOString(), user, posts, meetingRequests });
  } catch (err) {
    console.error('exportData error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteAccount(req: Request, res: Response): Promise<void> {
  const { password } = req.body as { password?: string };
  if (!password) { res.status(400).json({ error: 'Password confirmation required' }); return; }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { res.status(401).json({ error: 'Incorrect password' }); return; }

    // 1. Cancel all meeting requests
    await prisma.meetingRequest.updateMany({
      where: { OR: [{ requesterId: user.id }, { postOwnerId: user.id }] },
      data: { status: 'CANCELLED' },
    });

    // 2. Delete DRAFT posts; keep ACTIVE posts (owner anonymised via user update below)
    await prisma.post.deleteMany({ where: { ownerId: user.id, status: 'DRAFT' } });

    // 3. Anonymise user (soft delete)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: `deleted_${user.id}@deleted.healthai`,
        name: 'Deleted User',
        institution: 'N/A',
        passwordHash: '',
        isSuspended: true,
        verificationToken: null,
      },
    });

    auditService.log({ action: 'ACCOUNT_DELETED', userId: user.id });
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('deleteAccount error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { auditService } from '../services/auditService';

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers(req: Request, res: Response): Promise<void> {
  const { role, status } = req.query as Record<string, string>;

  const where: Prisma.UserWhereInput = {
    ...(role && { role: role as any }),
    ...(status === 'suspended' && { isSuspended: true }),
    ...(status === 'active' && { isSuspended: false, isVerified: true }),
    ...(status === 'unverified' && { isVerified: false }),
  };

  try {
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, role: true, name: true,
        institution: true, isVerified: true, isSuspended: true, createdAt: true,
      },
    });
    res.json(users);
  } catch (err) {
    console.error('admin.getUsers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function suspendUser(req: Request, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    if (user.role === 'ADMIN') { res.status(400).json({ error: 'Cannot suspend ADMIN users' }); return; }

    const nextSuspended = !user.isSuspended;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isSuspended: nextSuspended },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        institution: true,
        isVerified: true,
        isSuspended: true,
        createdAt: true,
      },
    });

    auditService.log({
      action: nextSuspended ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      userId: req.user!.id,
      entity: 'User',
      entityId: req.params.id,
    });

    res.json({
      message: nextSuspended ? 'User suspended' : 'User reactivated',
      user: updated,
    });
  } catch (err) {
    console.error('admin.suspendUser error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    if (user.role === 'ADMIN') { res.status(400).json({ error: 'Cannot delete ADMIN users' }); return; }

    await prisma.user.delete({ where: { id: req.params.id } });
    auditService.log({ action: 'USER_DELETED', userId: req.user!.id, entity: 'User', entityId: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('admin.deleteUser error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function adminGetPosts(req: Request, res: Response): Promise<void> {
  const { status } = req.query as Record<string, string>;

  try {
    const posts = await prisma.post.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { owner: { select: { id: true, name: true, email: true, institution: true } } },
    });
    res.json(posts);
  } catch (err) {
    console.error('admin.getPosts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function adminDeletePost(req: Request, res: Response): Promise<void> {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) { res.status(404).json({ error: 'Post not found' }); return; }

    await prisma.$transaction([
      prisma.meetingRequest.deleteMany({ where: { postId: req.params.id } }),
      prisma.post.delete({ where: { id: req.params.id } }),
    ]);

    auditService.log({ action: 'POST_MODERATED', userId: req.user!.id, entity: 'Post', entityId: req.params.id });
    res.json({ message: 'Post removed' });
  } catch (err) {
    console.error('admin.deletePost error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── Logs ─────────────────────────────────────────────────────────────────────

export async function getLogs(req: Request, res: Response): Promise<void> {
  const { from, to, action, userId, page = '1', limit = '50' } = req.query as Record<string, string>;

  const where: Prisma.ActivityLogWhereInput = {
    ...(from && { createdAt: { gte: new Date(from) } }),
    ...(to && { createdAt: { lte: new Date(to) } }),
    ...(action && { action }),
    ...(userId && { userId }),
  };

  const skip = (Number(page) - 1) * Number(limit);

  try {
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: { user: { select: { email: true } } },
      }),
      prisma.activityLog.count({ where }),
    ]);
    res.json({ logs, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('admin.getLogs error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function exportLogs(req: Request, res: Response): Promise<void> {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } },
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `health-ai-audit-${dateStr}.csv`;

    const header = 'timestamp,action,userId,userEmail,entity,entityId,ipAddress\n';
    const rows = logs.map(l => [
      l.createdAt.toISOString(),
      l.action,
      l.userId ?? '',
      (l.user as any)?.email ?? '',
      l.entity ?? '',
      l.entityId ?? '',
      l.ipAddress ?? '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(header + rows);
  } catch (err) {
    console.error('admin.exportLogs error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

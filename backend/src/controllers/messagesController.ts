import { Request, Response } from 'express';
import prisma from '../lib/prisma';

async function getMeeting(meetingId: string, userId: string) {
  return prisma.meetingRequest.findFirst({
    where: {
      id: meetingId,
      OR: [{ requesterId: userId }, { postOwnerId: userId }],
    },
  });
}

export async function getMessages(req: Request, res: Response): Promise<void> {
  const { meetingId } = req.params;
  const userId = req.user!.id;

  const meeting = await getMeeting(meetingId, userId);
  if (!meeting) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const messages = await prisma.message.findMany({
    where: { meetingId },
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { id: true, name: true, role: true } } },
  });

  res.json(messages);
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const { meetingId } = req.params;
  const userId = req.user!.id;
  const { content } = req.body as { content?: string };

  if (!content?.trim()) {
    res.status(400).json({ error: 'Message content is required' });
    return;
  }

  const meeting = await getMeeting(meetingId, userId);
  if (!meeting) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const message = await prisma.message.create({
    data: { meetingId, senderId: userId, content: content.trim() },
    include: { sender: { select: { id: true, name: true, role: true } } },
  });

  res.status(201).json(message);
}

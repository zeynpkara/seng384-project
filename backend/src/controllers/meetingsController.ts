import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { auditService } from '../services/auditService';
import { transition } from '../utils/postLifecycle';

const slotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
});

const proposeSlotsSchema = z.object({
  slots: z.array(slotSchema).min(1).max(3),
  meetingLink: z.string().url('Meeting link must be a valid URL').optional().or(z.literal('')),
});

const confirmSlotSchema = z.object({
  slot: slotSchema,
});

// GET /api/meetings/check/:postId
export async function checkInterest(req: Request, res: Response): Promise<void> {
  try {
    const meeting = await prisma.meetingRequest.findFirst({
      where: { postId: req.params.postId, requesterId: req.user!.id },
    });
    if (!meeting) {
      res.json({ hasInterest: false });
      return;
    }
    res.json({ hasInterest: true, meetingId: meeting.id, status: meeting.status });
  } catch (err) {
    console.error('checkInterest error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/meetings/express-interest/:postId
export async function expressInterest(req: Request, res: Response): Promise<void> {
  const { postId } = req.params;
  const { message } = req.body as { message?: string };

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
    if (post.status !== 'ACTIVE') { res.status(400).json({ error: 'Post is not accepting interest' }); return; }
    if (post.ownerId === req.user!.id) { res.status(400).json({ error: 'You cannot express interest in your own post' }); return; }

    // Duplicate guard
    const existing = await prisma.meetingRequest.findFirst({
      where: { postId, requesterId: req.user!.id },
    });
    if (existing) {
      res.status(409).json({ error: 'You have already expressed interest in this post', meetingId: existing.id, status: existing.status });
      return;
    }

    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
    const hasNda = !!user.ndaAcceptedAt;

    const meeting = await prisma.meetingRequest.create({
      data: {
        postId,
        requesterId: req.user!.id,
        postOwnerId: post.ownerId,
        message: message ?? null,
        status: hasNda ? 'PENDING' : 'NDA_PENDING',
        ndaAccepted: hasNda,
        ndaAcceptedAt: hasNda ? user.ndaAcceptedAt : null,
      },
    });

    auditService.log({ action: 'INTEREST_EXPRESSED', userId: req.user!.id, entity: 'MeetingRequest', entityId: meeting.id });

    if (!hasNda) {
      res.json({ requiresNDA: true, meetingId: meeting.id });
      return;
    }

    res.status(201).json({ requiresNDA: false, meetingId: meeting.id, status: meeting.status });
  } catch (err) {
    console.error('expressInterest error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/meetings/:id/accept-nda
export async function acceptNda(req: Request, res: Response): Promise<void> {
  try {
    const meeting = await prisma.meetingRequest.findUnique({ where: { id: req.params.id } });
    if (!meeting) { res.status(404).json({ error: 'Meeting request not found' }); return; }
    if (meeting.requesterId !== req.user!.id) { res.status(403).json({ error: 'Forbidden' }); return; }
    if (meeting.status !== 'NDA_PENDING') { res.status(400).json({ error: 'NDA already processed' }); return; }

    const now = new Date();

    // NDA is permanent — update user once
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { ndaAcceptedAt: now },
    });

    const updated = await prisma.meetingRequest.update({
      where: { id: req.params.id },
      data: { status: 'PENDING', ndaAccepted: true, ndaAcceptedAt: now },
    });

    auditService.log({ action: 'NDA_ACCEPTED', userId: req.user!.id, entity: 'MeetingRequest', entityId: meeting.id });

    res.json(updated);
  } catch (err) {
    console.error('acceptNda error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/meetings/:id/propose-slots — post owner
export async function proposeSlots(req: Request, res: Response): Promise<void> {
  const parsed = proposeSlotsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  try {
    const meeting = await prisma.meetingRequest.findUnique({ where: { id: req.params.id } });
    if (!meeting) { res.status(404).json({ error: 'Meeting request not found' }); return; }
    if (meeting.postOwnerId !== req.user!.id) { res.status(403).json({ error: 'Only the post owner can propose slots' }); return; }
    if (meeting.status !== 'PENDING') { res.status(400).json({ error: 'Meeting is not in PENDING status' }); return; }

    const updated = await prisma.meetingRequest.update({
      where: { id: req.params.id },
      data: {
        proposedSlots: parsed.data.slots,
        status: 'SLOTS_PROPOSED',
        ...(parsed.data.meetingLink ? { meetingLink: parsed.data.meetingLink } : {}),
      },
    });

    auditService.log({ action: 'SLOTS_PROPOSED', userId: req.user!.id, entity: 'MeetingRequest', entityId: meeting.id });
    res.json(updated);
  } catch (err) {
    console.error('proposeSlots error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PATCH /api/meetings/:id/confirm-slot — requester
export async function confirmSlot(req: Request, res: Response): Promise<void> {
  const parsed = confirmSlotSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  try {
    const meeting = await prisma.meetingRequest.findUnique({ where: { id: req.params.id } });
    if (!meeting) { res.status(404).json({ error: 'Meeting request not found' }); return; }
    if (meeting.requesterId !== req.user!.id) { res.status(403).json({ error: 'Only the requester can confirm a slot' }); return; }
    if (meeting.status !== 'SLOTS_PROPOSED') { res.status(400).json({ error: 'No slots have been proposed yet' }); return; }

    // Verify chosen slot is among proposed ones
    const proposed = (meeting.proposedSlots as Array<{ date: string; time: string }>) ?? [];
    const { slot } = parsed.data;
    const valid = proposed.some(s => s.date === slot.date && s.time === slot.time);
    if (!valid) { res.status(400).json({ error: 'Selected slot is not among proposed options' }); return; }

    const updated = await prisma.meetingRequest.update({
      where: { id: req.params.id },
      data: { confirmedSlot: slot, status: 'CONFIRMED' },
    });

    // Transition post to MEETING_SCHEDULED (system-triggered)
    try {
      await transition(meeting.postId, 'MEETING_SCHEDULED', 'SYSTEM');
    } catch {
      // Post may already be MEETING_SCHEDULED — not fatal
    }

    auditService.log({ action: 'MEETING_CONFIRMED', userId: req.user!.id, entity: 'MeetingRequest', entityId: meeting.id });
    res.json(updated);
  } catch (err) {
    console.error('confirmSlot error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PATCH /api/meetings/:id/reject — either party
export async function rejectMeeting(req: Request, res: Response): Promise<void> {
  try {
    const meeting = await prisma.meetingRequest.findUnique({ where: { id: req.params.id } });
    if (!meeting) { res.status(404).json({ error: 'Meeting request not found' }); return; }

    const isParty = meeting.requesterId === req.user!.id || meeting.postOwnerId === req.user!.id;
    if (!isParty) { res.status(403).json({ error: 'Forbidden' }); return; }

    const terminal: string[] = ['CONFIRMED', 'REJECTED', 'CANCELLED'];
    if (terminal.includes(meeting.status)) {
      res.status(400).json({ error: `Cannot reject a meeting in ${meeting.status} status` });
      return;
    }

    const updated = await prisma.meetingRequest.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED' },
    });

    auditService.log({ action: 'MEETING_REJECTED', userId: req.user!.id, entity: 'MeetingRequest', entityId: meeting.id });
    res.json(updated);
  } catch (err) {
    console.error('rejectMeeting error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/meetings/mine
export async function getMyMeetings(req: Request, res: Response): Promise<void> {
  try {
    const meetings = await prisma.meetingRequest.findMany({
      where: {
        OR: [{ requesterId: req.user!.id }, { postOwnerId: req.user!.id }],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        post: { select: { id: true, title: true, domain: true, city: true, preferredPlatform: true } },
        requester: { select: { id: true, name: true, institution: true, role: true } },
        postOwner: { select: { id: true, name: true, institution: true, role: true } },
      },
    });
    res.json(meetings);
  } catch (err) {
    console.error('getMyMeetings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

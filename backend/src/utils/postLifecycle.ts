import { PostStatus } from '@prisma/client';
import prisma from '../lib/prisma';

type Trigger = 'OWNER' | 'SYSTEM' | 'ADMIN';

const ALLOWED: Partial<Record<PostStatus, Partial<Record<PostStatus, Trigger[]>>>> = {
  DRAFT: {
    ACTIVE: ['OWNER'],
  },
  ACTIVE: {
    MEETING_SCHEDULED: ['SYSTEM'],
    EXPIRED: ['SYSTEM'],
    CLOSED: ['ADMIN'],
  },
  MEETING_SCHEDULED: {
    CLOSED: ['OWNER', 'ADMIN'],
  },
  // CLOSED and EXPIRED are terminal — no outgoing transitions
};

export function canTransition(from: PostStatus, to: PostStatus, triggeredBy: Trigger): boolean {
  return ALLOWED[from]?.[to]?.includes(triggeredBy) ?? false;
}

export async function transition(
  postId: string,
  to: PostStatus,
  triggeredBy: Trigger,
  userId?: string,
) {
  const post = await prisma.post.findUniqueOrThrow({ where: { id: postId } });

  if (!canTransition(post.status, to, triggeredBy)) {
    throw new Error(
      `Cannot transition post from ${post.status} to ${to} triggered by ${triggeredBy}`,
    );
  }

  return prisma.post.update({
    where: { id: postId },
    data: { status: to },
  });
}

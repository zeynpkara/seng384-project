import { Request, Response } from 'express';
import { z } from 'zod';
import { PostStatus, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { auditService } from '../services/auditService';
import { transition } from '../utils/postLifecycle';

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  domain: z.string().min(1, 'Domain is required'),
  description: z.string().min(1, 'Description is required'),
  requiredExpertise: z.string().min(1, 'Required expertise is required'),
  projectStage: z.enum(['IDEA', 'CONCEPT_VALIDATION', 'PROTOTYPE', 'PILOT_TESTING', 'PRE_DEPLOYMENT']),
  confidentiality: z.enum(['PUBLIC', 'MEETING_ONLY']),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  commitmentLevel: z.string().min(1, 'Commitment level is required'),
  expiresAt: z.string().datetime().optional(),
  autoClose: z.boolean().optional().default(false),
});

const updatePostSchema = createPostSchema.partial();

const PUBLIC_STATUSES: PostStatus[] = ['ACTIVE', 'MEETING_SCHEDULED'];

const ownerSelect = {
  select: { name: true, institution: true },
};

function formatPost(post: any, ownerView = false) {
  const base = {
    id: post.id,
    title: post.title,
    domain: post.domain,
    description:
      !ownerView && post.confidentiality === 'MEETING_ONLY'
        ? post.description.slice(0, 120) + '…'
        : post.description,
    requiredExpertise: post.requiredExpertise,
    projectStage: post.projectStage,
    confidentiality: post.confidentiality,
    city: post.city,
    country: post.country,
    commitmentLevel: post.commitmentLevel,
    status: post.status,
    expiresAt: post.expiresAt,
    autoClose: post.autoClose,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    owner: post.owner,
  };
  return base;
}

export async function getPosts(req: Request, res: Response): Promise<void> {
  const { city, domain, status, expertise, limit } = req.query as Record<string, string>;

  const where: Prisma.PostWhereInput = {
    status: { in: PUBLIC_STATUSES },
    ...(city && { city: { contains: city, mode: 'insensitive' } }),
    ...(domain && { domain: { contains: domain, mode: 'insensitive' } }),
    ...(expertise && { requiredExpertise: { contains: expertise, mode: 'insensitive' } }),
    ...(status && PUBLIC_STATUSES.includes(status as PostStatus) && { status: status as PostStatus }),
  };

  try {
    const posts = await prisma.post.findMany({
      where,
      take: limit ? Number(limit) : undefined,
      orderBy: { createdAt: 'desc' },
      include: { owner: ownerSelect },
    });
    res.json(posts.map(p => formatPost(p)));
  } catch (err) {
    console.error('getPosts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getMyPosts(req: Request, res: Response): Promise<void> {
  try {
    const posts = await prisma.post.findMany({
      where: { ownerId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: { owner: ownerSelect },
    });
    res.json(posts.map(p => formatPost(p, true)));
  } catch (err) {
    console.error('getMyPosts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPost(req: Request, res: Response): Promise<void> {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: { owner: ownerSelect },
    });
    if (!post) { res.status(404).json({ error: 'Post not found' }); return; }

    const isOwner = req.user?.id === post.ownerId;
    res.json(formatPost(post, isOwner));
  } catch (err) {
    console.error('getPost error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createPost(req: Request, res: Response): Promise<void> {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { expiresAt, ...rest } = parsed.data;

  try {
    const post = await prisma.post.create({
      data: {
        ...rest,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        ownerId: req.user!.id,
        status: 'DRAFT',
      },
      include: { owner: ownerSelect },
    });

    auditService.log({ action: 'POST_CREATED', userId: req.user!.id, entity: 'Post', entityId: post.id });
    res.status(201).json(formatPost(post, true));
  } catch (err) {
    console.error('createPost error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updatePost(req: Request, res: Response): Promise<void> {
  const parsed = updatePostSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
    if (post.ownerId !== req.user!.id) { res.status(403).json({ error: 'Forbidden' }); return; }
    if (!['DRAFT', 'ACTIVE'].includes(post.status)) {
      res.status(400).json({ error: 'Only DRAFT or ACTIVE posts can be edited' });
      return;
    }

    const { expiresAt, ...rest } = parsed.data;
    const updated = await prisma.post.update({
      where: { id: req.params.id },
      data: { ...rest, ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }) },
      include: { owner: ownerSelect },
    });

    auditService.log({ action: 'POST_EDITED', userId: req.user!.id, entity: 'Post', entityId: post.id });
    res.json(formatPost(updated, true));
  } catch (err) {
    console.error('updatePost error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function publishPost(req: Request, res: Response): Promise<void> {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
    if (post.ownerId !== req.user!.id) { res.status(403).json({ error: 'Forbidden' }); return; }

    const updated = await transition(req.params.id, 'ACTIVE', 'OWNER', req.user!.id);
    auditService.log({ action: 'POST_PUBLISHED', userId: req.user!.id, entity: 'Post', entityId: post.id });
    res.json(updated);
  } catch (err: any) {
    if (err.message?.includes('Cannot transition')) {
      res.status(400).json({ error: err.message });
    } else {
      console.error('publishPost error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export async function closePost(req: Request, res: Response): Promise<void> {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
    if (post.ownerId !== req.user!.id) { res.status(403).json({ error: 'Forbidden' }); return; }

    const updated = await transition(req.params.id, 'CLOSED', 'OWNER', req.user!.id);
    auditService.log({ action: 'POST_CLOSED', userId: req.user!.id, entity: 'Post', entityId: post.id });
    res.json(updated);
  } catch (err: any) {
    if (err.message?.includes('Cannot transition')) {
      res.status(400).json({ error: err.message });
    } else {
      console.error('closePost error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
    if (post.ownerId !== req.user!.id) { res.status(403).json({ error: 'Forbidden' }); return; }
    if (post.status !== 'DRAFT') {
      res.status(400).json({ error: 'Only DRAFT posts can be deleted' });
      return;
    }

    await prisma.post.delete({ where: { id: req.params.id } });
    auditService.log({ action: 'POST_DELETED', userId: req.user!.id, entity: 'Post', entityId: post.id });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('deletePost error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

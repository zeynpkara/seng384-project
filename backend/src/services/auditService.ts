import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

interface LogInput {
  action: string;
  userId?: string;
  entity?: string;
  entityId?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

export const auditService = {
  log(data: LogInput): void {
    const record: Prisma.ActivityLogUncheckedCreateInput = {
      action: data.action,
      userId: data.userId,
      entity: data.entity,
      entityId: data.entityId,
      ipAddress: data.ipAddress,
      metadata: data.metadata as Prisma.InputJsonValue | undefined,
    };
    prisma.activityLog.create({ data: record }).catch(() => {
      // Fire-and-forget: log failures must never crash the response
    });
  },
};

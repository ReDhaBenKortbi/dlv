import { UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ChargilyService } from './chargily.service';

const SECRET = 'test-secret-key';

// Minimal prisma double: only the methods ChargilyService touches.
function createPrismaMock() {
  return {
    paymentRequest: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    user: {
      update: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    // handleWebhookEvent passes an array of prepared operations; just resolve.
    $transaction: jest.fn().mockResolvedValue([]),
  };
}

function sign(rawBody: Buffer, secret = SECRET): string {
  return createHmac('sha256', secret).update(rawBody).digest('hex');
}

describe('ChargilyService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: ChargilyService;

  beforeEach(() => {
    process.env.CHARGILY_SECRET = SECRET;
    prisma = createPrismaMock();
    service = new ChargilyService(prisma as unknown as PrismaService);
  });

  describe('verifySignature', () => {
    it('accepts a signature computed with the correct secret', () => {
      const body = Buffer.from(JSON.stringify({ type: 'checkout.paid' }));
      expect(service.verifySignature(sign(body), body)).toBe(true);
    });

    it('rejects a signature computed with the wrong secret', () => {
      const body = Buffer.from('{"type":"checkout.paid"}');
      expect(service.verifySignature(sign(body, 'wrong'), body)).toBe(false);
    });

    it('rejects an empty signature', () => {
      const body = Buffer.from('{}');
      expect(service.verifySignature('', body)).toBe(false);
    });

    it('rejects a short/malformed signature without throwing (length mismatch)', () => {
      const body = Buffer.from('{}');
      expect(() => service.verifySignature('abc', body)).not.toThrow();
      expect(service.verifySignature('abc', body)).toBe(false);
    });
  });

  describe('handleWebhookEvent', () => {
    const checkoutId = 'ck_123';

    function pendingRequest(overrides: Partial<Record<string, unknown>> = {}) {
      return {
        id: 'pr_1',
        userId: 'u_1',
        plan: 'PRO',
        status: 'PENDING',
        ...overrides,
      };
    }

    it('rejects an invalid signature and writes nothing', async () => {
      const event = { type: 'checkout.paid', data: { id: checkoutId } };
      const body = Buffer.from(JSON.stringify(event));

      await expect(
        service.handleWebhookEvent('bad-signature', body, event),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(prisma.paymentRequest.findUnique).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('activates the subscription on a valid checkout.paid event', async () => {
      const event = { type: 'checkout.paid', data: { id: checkoutId } };
      const body = Buffer.from(JSON.stringify(event));
      prisma.paymentRequest.findUnique.mockResolvedValue(pendingRequest());

      await service.handleWebhookEvent(sign(body), body, event);

      const prUpdateCalls = prisma.paymentRequest.update.mock.calls as Array<
        [{ where: { id: string }; data: { status: string } }]
      >;
      expect(prUpdateCalls[0][0].where).toEqual({ id: 'pr_1' });
      expect(prUpdateCalls[0][0].data.status).toBe('APPROVED');

      const userUpdateCalls = prisma.user.update.mock.calls as Array<
        [
          {
            where: { id: string };
            data: {
              isSubscribed: boolean;
              subscriptionStatus: string;
              subscriptionPlan: string;
              subscriptionEndDate: Date;
            };
          },
        ]
      >;
      const userUpdate = userUpdateCalls[0][0];
      expect(userUpdate.where).toEqual({ id: 'u_1' });
      expect(userUpdate.data.isSubscribed).toBe(true);
      expect(userUpdate.data.subscriptionStatus).toBe('APPROVED');
      expect(userUpdate.data.subscriptionPlan).toBe('PRO');

      // subscriptionEndDate ~ one month out.
      const end = userUpdate.data.subscriptionEndDate;
      const expected = new Date();
      expected.setMonth(expected.getMonth() + 1);
      expect(Math.abs(end.getTime() - expected.getTime())).toBeLessThan(60_000);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('is idempotent: an already-APPROVED request is not re-activated', async () => {
      const event = { type: 'checkout.paid', data: { id: checkoutId } };
      const body = Buffer.from(JSON.stringify(event));
      prisma.paymentRequest.findUnique.mockResolvedValue(
        pendingRequest({ status: 'APPROVED' }),
      );

      await service.handleWebhookEvent(sign(body), body, event);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('ignores unrelated event types', async () => {
      const event = { type: 'checkout.created', data: { id: checkoutId } };
      const body = Buffer.from(JSON.stringify(event));

      await service.handleWebhookEvent(sign(body), body, event);

      expect(prisma.paymentRequest.findUnique).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it.each(['checkout.failed', 'checkout.canceled', 'checkout.expired'])(
      'rejects the payment request and resets subscriptionStatus on %s',
      async (type) => {
        const event = { type, data: { id: checkoutId } };
        const body = Buffer.from(JSON.stringify(event));
        prisma.paymentRequest.findUnique.mockResolvedValue(pendingRequest());

        await service.handleWebhookEvent(sign(body), body, event);

        const prUpdateCalls = prisma.paymentRequest.update.mock.calls as Array<
          [{ where: { id: string }; data: { status: string } }]
        >;
        expect(prUpdateCalls[0][0].where).toEqual({ id: 'pr_1' });
        expect(prUpdateCalls[0][0].data.status).toBe('REJECTED');

        const userUpdateCalls = prisma.user.update.mock.calls as Array<
          [{ where: { id: string }; data: { subscriptionStatus: string } }]
        >;
        expect(userUpdateCalls[0][0].where).toEqual({ id: 'u_1' });
        expect(userUpdateCalls[0][0].data.subscriptionStatus).toBe('REJECTED');

        expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      },
    );

    it('is idempotent: an already-REJECTED request is not re-processed on a failure event', async () => {
      const event = { type: 'checkout.failed', data: { id: checkoutId } };
      const body = Buffer.from(JSON.stringify(event));
      prisma.paymentRequest.findUnique.mockResolvedValue(
        pendingRequest({ status: 'REJECTED' }),
      );

      await service.handleWebhookEvent(sign(body), body, event);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('no-ops when the checkout id is unknown', async () => {
      const event = { type: 'checkout.paid', data: { id: 'nope' } };
      const body = Buffer.from(JSON.stringify(event));
      prisma.paymentRequest.findUnique.mockResolvedValue(null);

      await service.handleWebhookEvent(sign(body), body, event);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('cancelPendingSubscription', () => {
    const userId = 'u_1';

    it('no-ops when the user is not PENDING', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue({
        subscriptionStatus: 'APPROVED',
      });

      await service.cancelPendingSubscription(userId);

      expect(prisma.paymentRequest.findFirst).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects the latest pending request and resets the user when PENDING', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue({
        subscriptionStatus: 'PENDING',
      });
      prisma.paymentRequest.findFirst.mockResolvedValue({
        id: 'pr_1',
        userId,
        status: 'PENDING',
      });

      await service.cancelPendingSubscription(userId);

      expect(prisma.paymentRequest.findFirst).toHaveBeenCalledWith({
        where: { userId, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
      });

      const prUpdateCalls = prisma.paymentRequest.update.mock.calls as Array<
        [{ where: { id: string }; data: { status: string } }]
      >;
      expect(prUpdateCalls[0][0].where).toEqual({ id: 'pr_1' });
      expect(prUpdateCalls[0][0].data.status).toBe('REJECTED');

      const userUpdateCalls = prisma.user.update.mock.calls as Array<
        [{ where: { id: string }; data: { subscriptionStatus: string } }]
      >;
      expect(userUpdateCalls[0][0].where).toEqual({ id: userId });
      expect(userUpdateCalls[0][0].data.subscriptionStatus).toBe('REJECTED');

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('still resets the user when PENDING but no matching payment request is found', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue({
        subscriptionStatus: 'PENDING',
      });
      prisma.paymentRequest.findFirst.mockResolvedValue(null);

      await service.cancelPendingSubscription(userId);

      expect(prisma.paymentRequest.update).not.toHaveBeenCalled();

      const userUpdateCalls = prisma.user.update.mock.calls as Array<
        [{ where: { id: string }; data: { subscriptionStatus: string } }]
      >;
      expect(userUpdateCalls[0][0].where).toEqual({ id: userId });
      expect(userUpdateCalls[0][0].data.subscriptionStatus).toBe('REJECTED');

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});

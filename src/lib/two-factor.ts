import crypto from 'crypto';
import { prisma } from './prisma';

const TWO_FACTOR_EXPIRY_MINUTES = 10;

export async function generateTwoFactorCode(userId: string): Promise<string> {
  // Generate a 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();
  
  // Store the code with expiry
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + TWO_FACTOR_EXPIRY_MINUTES);

  await prisma.twoFactorAuth.create({
    data: {
      userId,
      code,
      expiresAt,
      type: 'payroll',
    },
  });

  return code;
}

export async function verifyTwoFactorCode(
  userId: string,
  code: string,
  type: string = 'payroll'
): Promise<boolean> {
  const auth = await prisma.twoFactorAuth.findFirst({
    where: {
      userId,
      code,
      type,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!auth) {
    return false;
  }

  // Mark as used
  await prisma.twoFactorAuth.update({
    where: { id: auth.id },
    data: { used: true },
  });

  return true;
}

export async function requiresTwoFactor(
  userId: string,
  action: string
): Promise<boolean> {
  // Check user's security settings
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organizationMemberships: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (!user) return false;

  // Check if organization requires 2FA for sensitive actions
  const org = user.organizationMemberships[0]?.organization;
  if (org?.requireTwoFactorForPayroll && action === 'payroll') {
    return true;
  }

  // Check if user has enabled 2FA
  return user.twoFactorEnabled || false;
}

export async function cleanupExpiredCodes() {
  await prisma.twoFactorAuth.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { used: true },
      ],
    },
  });
}
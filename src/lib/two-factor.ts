import crypto from 'crypto';
import { prisma } from './prisma';

const TWO_FACTOR_EXPIRY_MINUTES = 10;

// Two-factor authentication is temporarily disabled
// To enable:
// 1. Add TwoFactorAuth model to Prisma schema
// 2. Add twoFactorEnabled and requireTwoFactorForPayroll fields to User/Organization models
// 3. Run prisma migrate
// 4. Uncomment the code below

export async function generateTwoFactorCode(userId: string): Promise<string> {
  // Generate a 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();
  
  console.warn('Two-factor authentication is temporarily disabled. Code:', code);
  
  // TODO: Store the code in database when TwoFactorAuth model is added
  /*
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
  */

  return code;
}

export async function verifyTwoFactorCode(
  userId: string,
  code: string,
  type: string = 'payroll'
): Promise<boolean> {
  console.warn('Two-factor authentication is temporarily disabled. Verification bypassed.');
  
  // TODO: Implement verification when TwoFactorAuth model is added
  /*
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
  */
  
  // For now, always return true to bypass 2FA
  return true;
}

export async function requiresTwoFactor(
  userId: string,
  action: string
): Promise<boolean> {
  console.warn('Two-factor authentication is temporarily disabled.');
  
  // TODO: Check user's security settings when fields are added to schema
  /*
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: true,
    },
  });

  if (!user) return false;

  // Check if organization requires 2FA for sensitive actions
  if (user.organization?.requireTwoFactorForPayroll && action === 'payroll') {
    return true;
  }

  // Check if user has enabled 2FA
  return user.twoFactorEnabled || false;
  */
  
  // For now, always return false to bypass 2FA
  return false;
}

export async function cleanupExpiredCodes() {
  console.warn('Two-factor authentication cleanup is temporarily disabled.');
  
  // TODO: Implement cleanup when TwoFactorAuth model is added
  /*
  await prisma.twoFactorAuth.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { used: true },
      ],
    },
  });
  */
}
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed file is intentionally empty for now
  // The application will work without seed data
  // Organizations and services are created dynamically through the UI
  console.log('Database ready for BusinessFlow!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
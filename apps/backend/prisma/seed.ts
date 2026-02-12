import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default counters
  await prisma.counter.upsert({
    where: { name: 'default' },
    update: {},
    create: {
      name: 'default',
      value: 0,
      prefix: '',
      padding: 6,
    },
  });

  await prisma.counter.upsert({
    where: { name: 'lotto' },
    update: {},
    create: {
      name: 'lotto',
      value: 0,
      prefix: 'LOT-',
      padding: 5,
    },
  });

  console.log('Seed completed');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

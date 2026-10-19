import { PrismaClient } from '@prisma/client';
import { CHART_OF_ACCOUNTS } from '../src/finance/config/chart-of-accounts';

const prisma = new PrismaClient({ log: ['warn', 'error'] });

async function main() {
  console.log('🌱 Seeding Chart of Accounts...');
  let created = 0,
    updated = 0;

  for (const def of CHART_OF_ACCOUNTS) {
    const result = await prisma.financialAccount.upsert({
      where: { code: def.code },
      update: {
        name: def.name,
        type: def.type as any,
        ownerType: def.ownerType as any,
        currency: def.currency,
        isActive: def.isActive,
      },
      create: {
        code: def.code,
        name: def.name,
        type: def.type as any,
        ownerType: def.ownerType as any,
        currency: def.currency,
        isActive: def.isActive,
      },
    });

    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      created++;
      console.log(`  ✅ Created: ${def.code} - ${def.name}`);
    } else {
      updated++;
      console.log(`  🔄 Updated: ${def.code} - ${def.name}`);
    }
  }

  console.log(`\n📊 Done: ${created} created, ${updated} updated.`);
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e);
    throw e;
  })
  .finally(() => prisma.$disconnect());

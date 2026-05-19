import { PrismaClient } from '@prisma/client';
import { VEHICLE_TYPES, DEFAULT_PRICING_RULES } from '@open-trade/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Seed vehicle types
  for (const vt of VEHICLE_TYPES) {
    const data = {
      name: vt.name,
      icon: vt.icon,
      sort: vt.sort,
      length: vt.length,
      width: vt.width,
      height: vt.height,
      loadCapacity: vt.loadCapacity,
      volume: vt.volume,
    };
    await prisma.vehicleType.upsert({
      where: { code: vt.code },
      update: data,
      create: { ...data, code: vt.code },
    });
  }
  console.log(`✅ Seeded ${VEHICLE_TYPES.length} vehicle types`);

  // 2. Seed pricing rules (delete all then recreate)
  await prisma.pricingRule.deleteMany();
  for (const rule of DEFAULT_PRICING_RULES) {
    await prisma.pricingRule.create({
      data: {
        vehicleTypeCode: rule.vehicleTypeCode,
        basePrice: rule.basePrice,
        includedKm: rule.includedKm,
        pricePerKm: rule.pricePerKm,
        surgeRules: rule.surgeRules ? JSON.parse(JSON.stringify(rule.surgeRules)) : [],
        effectiveDate: new Date('2025-01-01'),
      },
    });
  }
  console.log(`✅ Seeded ${DEFAULT_PRICING_RULES.length} pricing rules`);

  // 3. Create admin user
  await prisma.user.upsert({
    where: { phone: '13800000000' },
    update: {},
    create: {
      phone: '13800000000',
      name: '管理员',
      role: 'admin',
    },
  });
  console.log('✅ Seeded admin user (13800000000)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

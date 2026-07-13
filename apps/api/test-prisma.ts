import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

async function test() {
  console.log(process.env.DATABASE_URL);

  const prisma = new PrismaClient();

  await prisma.$connect();

  console.log('Connected!');

  await prisma.$disconnect();
}

void test();

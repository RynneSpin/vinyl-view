import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Check how many records exist
    const count = await prisma.record.count();
    console.log(`Found ${count} existing records`);

    if (count > 0) {
      // Delete all records
      const result = await prisma.record.deleteMany({});
      console.log(`Deleted ${result.count} records`);
    } else {
      console.log('No records to delete');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Failed:', error);
  process.exit(1);
});

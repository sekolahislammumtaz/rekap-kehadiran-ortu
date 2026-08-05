import { prisma } from "../src/lib/prisma";

async function testDb() {
  const kajian = await prisma.kajian.create({
    data: {
      title: "Test Kajian Setup",
      date: "2026-08-05",
    },
  });
  console.log("SUCCESS Created Kajian:", kajian);

  const count = await prisma.kajian.count();
  console.log("Total Kajian in DB:", count);

  // Cleanup test
  await prisma.kajian.delete({ where: { id: kajian.id } });
  console.log("Cleanup test completed successfully.");
}

testDb()
  .catch((e) => {
    console.error("DB Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

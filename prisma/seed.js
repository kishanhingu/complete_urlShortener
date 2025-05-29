import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function seed() {
  try {
    // Clear existing data
    await prisma.url_shortener.deleteMany();

    const fakeData = Array.from({ length: 100 }, () => ({
      url: "https://github.com/kishanhingu/complete_urlShortener",
      shortCode: faker.string.alphanumeric({ length: 6 }),
      userId: 1,
      createdAt: faker.date.past({ years: 1 }),
    }));

    await prisma.url_shortener.createMany({
      data: fakeData,
      skipDuplicates: true,
    });

    console.log("Successfully seeded 100 fake URL records");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

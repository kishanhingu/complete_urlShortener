import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getData = async () => {
  const allShortLinks = await prisma.url_shortener.findMany();
  return allShortLinks;
};

export const saveData = async ({ url, shortCode }) => {
  await prisma.url_shortener.create({
    data: {
      url: url,
      shortCode: shortCode,
    },
  });
};

export const getLinkByShortCode = async (shortCode) => {
  const data = await prisma.url_shortener.findUnique({
    where: { shortCode: shortCode },
  });
  return data;
};

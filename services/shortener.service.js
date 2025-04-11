import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getData = async (id) => {
  const allShortLinks = await prisma.url_shortener.findMany({
    where: { userId: id },
  });
  return allShortLinks;
};

export const saveData = async ({ url, shortCode, userId }) => {
  await prisma.url_shortener.create({
    data: {
      url: url,
      shortCode: shortCode,
      userId: userId,
    },
  });
};

export const getLinkByShortCode = async (shortCode) => {
  const data = await prisma.url_shortener.findUnique({
    where: { shortCode: shortCode },
  });
  return data;
};

// findShortLinkById
export const findShortLinkById = async (id) => {
  const data = await prisma.url_shortener.findUnique({ where: { id: id } });
  return data;
};

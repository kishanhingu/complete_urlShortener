import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getData = async ({ userId, limit = 5, offset = 0 }) => {
  const shortLink = await prisma.url_shortener.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  const totalCount = await prisma.url_shortener.count({
    where: {
      userId: userId,
    },
  });

  return { shortLink, totalCount };
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

// updateShortCode
export const updateShortCode = async ({ id, url, shortCode }) => {
  return await prisma.url_shortener.update({
    where: { id },
    data: { url, shortCode },
  });
};

// deleteShortCode
export const deleteShortCode = async (id) => {
  return await prisma.url_shortener.delete({ where: { id: id } });
};

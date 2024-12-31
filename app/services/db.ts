import { PrismaClient} from '@prisma/client';

export const prisma = new PrismaClient();

export async function createTranslation(hashId: string, text: string) {
  return await prisma.translation.create({
    data: {
      hashId,
      text,
    },
  });
}

export async function getTranslation(hashId: string) {
  return await prisma.translation.findUnique({
    where: {
      hashId,
    },
  });
}

export async function createDictLookup(hashId: string, text: string) {
  return await prisma.dictLookup.create({
    data: {
      hashId,
      text,
    },
  });
}

export async function getDictLookup(hashId: string) {
  return await prisma.dictLookup.findUnique({
    where: {
      hashId,
    },
  });
}
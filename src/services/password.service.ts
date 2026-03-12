import { prisma } from '../lib/prisma';
import { EncryptedData } from '../utils/encryption';

type CreatePasswordInput = {
  userId: string;
  username: string;
  service: string;
  category: string;
  password: EncryptedData;
  googleLogin: boolean;
};

type UpdatePasswordInput = {
  service?: string;
  username?: string;
  password?: string;
  category?: string;
  googleLogin?: boolean;
};

export const createPasswordRecord = async (data: CreatePasswordInput) => {
  const now = new Date();
  return await prisma.passwordRecord.create({
    data: {
      service: data.service,
      username: data.username,
      password: JSON.stringify(data.password),
      category: data.category,
      googleLogin: data.googleLogin,
      createdAt: now,
      updatedAt: now,
      user: {
        connect: { id: data.userId },
      },
    },
  });
};

export const getPasswordsByUserId = async (userId: string) => {
  return await prisma.passwordRecord.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
};

export const updatePasswordRecord = async (
  recordId: string,
  userId: string,
  data: UpdatePasswordInput
) => {
  return await prisma.passwordRecord.update({
    where: {
      id: recordId,
      userId: userId,
    },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
};

export const deletePasswordRecord = async (recordId: string, userId: string) => {
  return await prisma.passwordRecord.delete({
    where: {
      id: recordId,
      userId: userId,
    },
  });
};
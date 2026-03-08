import { prisma } from '../lib/prisma';
import { EncryptedData } from '../utils/encryption';

type CreatePasswordInput = {
  userId: string;
  username: string;
  service: string;
  category: string;
  password: EncryptedData;
};

type UpdatePasswordInput = {
  service?: string;
  username?: string;
  password?: string; 
  category?: string;
};

export const createPasswordRecord = async (data: CreatePasswordInput) => {
  return await prisma.passwordRecord.create({
    data: {
      service: data.service,
      username: data.username,
      password: JSON.stringify(data.password), 
      category: data.category,
      user: {
        connect: { id: data.userId },
      },
    },
  });
};

export const getPasswordsByUserId = async (userId: string) => {
  return await prisma.passwordRecord.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
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
    data,
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
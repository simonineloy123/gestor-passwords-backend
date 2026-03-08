import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

type CreateUserInput = {
  email: string;
  password: string;
};

export const createUser = async (data: CreateUserInput) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
    },
  });
};

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      passwordRecords: true,
    },
  });
};

// src/utils/password.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class Password {
  private constructor(private readonly hashedPassword: string) {}

  // Crear un Password a partir de texto plano (hash automático)
  static async fromPlainText(plainText: string): Promise<Password> {
    const hash = await bcrypt.hash(plainText, SALT_ROUNDS);
    return new Password(hash);
  }

  // Reconstruir Password desde un hash existente
  static fromHashed(hashed: string): Password {
    return new Password(hashed);
  }

  // Comparar texto plano con el hash interno
  async matches(plainText: string): Promise<boolean> {
    return await bcrypt.compare(plainText, this.hashedPassword);
  }

  // Obtener el hash (para guardar en DB)
  get value(): string {
    return this.hashedPassword;
  }
}

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class Password {
  private constructor(private readonly hashedPassword: string) {}

  static async fromPlainText(plainText: string): Promise<Password> {
    const hash = await bcrypt.hash(plainText, SALT_ROUNDS);
    return new Password(hash);
  }

  static fromHashed(hashed: string): Password {
    return new Password(hashed);
  }

  async matches(plainText: string): Promise<boolean> {
    return await bcrypt.compare(plainText, this.hashedPassword);
  }

  get value(): string {
    return this.hashedPassword;
  }
}

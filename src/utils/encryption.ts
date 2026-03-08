import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16; 
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be set and be 32 characters long');
}

export interface EncryptedData {
  iv: string; 
  salt: string; 
  tag: string; 
  encrypted: string; 
}

export const encrypt = (text: string): EncryptedData => {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, 'sha256');

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    salt: salt.toString('hex'),
    tag: tag.toString('hex'),
    encrypted,
  };
};

export const decrypt = (encryptedData: EncryptedData): string => {
  const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, Buffer.from(encryptedData.salt, 'hex'), 100000, 32, 'sha256');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(encryptedData.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
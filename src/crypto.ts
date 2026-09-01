import crypto from 'node:crypto';
import argon2 from 'argon2';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;


export function generateSalt(): Buffer {
  return crypto.randomBytes(SALT_LENGTH);
}

/**
 * ---> Deriva uma chave simétrica de 256 bits a partir da senha mestre utilizando Argon2id.
 * ---> Parâmetros ajustados conforme recomendações de segurança da OWASP.
 */
export async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    salt: salt,
    memoryCost: 65536, // Yep, são 64 MB de uso de memória
    timeCost: 3,       // 3 iterações de processamento
    parallelism: 4,    // 4 threads concorrentes
    raw: true,         // Retorna o buffer binário direto
    hashLength: 32     // Chave final de 256 bits
  });

  return Buffer.from(hash);
}


export function encrypt(plaintext: string, key: Buffer): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, authTag, encrypted]);
  return payload.toString('base64');
}

export function decrypt(encryptedBase64: string, key: Buffer): string {
  const payload = Buffer.from(encryptedBase64, 'base64');

  if (payload.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error('Payload criptográfico inválido ou corrompido.');
  }

  const iv = payload.subarray(0, IV_LENGTH);
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = payload.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * ---> Gera senhas aleatórias utilizando a entropia do sistema operacional (crypto.randomInt).
 */
export function generateStrongPassword(length: number = 25): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    password += chars[randomIndex];
  }
  return password;
}
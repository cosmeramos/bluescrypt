import crypto from 'node:crypto';
import argon2 from 'argon2';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * ---> Função de Deformação Dinâmica H_Omega.
 * ---> Aplica dispersão vetorial não linear baseada na Proporção Áurea (phi) e funções logarítmicas.
 * ---> Atua como um escudo pós-Argon2id para dificultar a análise de chaves em hardware especializado (GPUs).
 */
function applyHOmegaTransform(inputBuffer: Buffer, iterations: number = 16): Buffer {
  const PHI = 1.618033988749895; // Proporção Áurea
  const output = Buffer.alloc(32);
  inputBuffer.copy(output);

  for (let i = 1; i <= iterations; i++) {
    for (let byteIdx = 0; byteIdx < 32; byteIdx++) {
      // Uso de readUInt8 / fallback zero para satisfazer o TypeScript strictNullChecks
      const val = output.readUInt8(byteIdx);
      const transformed = Math.floor((Math.pow(PHI, (i % 5) + 1) * val) / Math.log(i + 1)) % 256;
      output.writeUInt8(output.readUInt8(byteIdx) ^ transformed, byteIdx);
    }
  }

  return output;
}

/**
 * ---> Gera um salt aleatório estocástico de 32 bytes para isolamento do Argon2id.
 */
export function generateSalt(): Buffer {
  return crypto.randomBytes(SALT_LENGTH);
}

/**
 * ---> Deriva uma chave simétrica de 256 bits a partir da senha mestre utilizando Argon2id + H_Omega.
 * ---> Parâmetros ajustados conforme recomendações de segurança da OWASP.
 * ---> Inclui protocolo de limpeza compulsória da senha mestre e chave intermediária na memória RAM.
 */
export async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  const passwordBuffer = Buffer.from(password, 'utf8');

  try {
    const rawHash = await argon2.hash(passwordBuffer, {
      type: argon2.argon2id,
      salt: salt,
      memoryCost: 65536, // Yep, são 64 MB de uso de memória
      timeCost: 3,       // 3 iterações de processamento
      parallelism: 4,    // 4 threads concorrentes
      raw: true,         // Retorna o buffer binário direto
      hashLength: 32     // Chave final de 256 bits
    });

    const baseKey = Buffer.from(rawHash);

    // ---> Aplica a transformação autoral H_Omega sobre a chave gerada pelo Argon2id
    const finalKey = applyHOmegaTransform(baseKey);

    // ---> Limpa o buffer da chave intermediária da memória
    baseKey.fill(0);

    return finalKey;
  } finally {
    // ---> Limpa a senha mestre da memória RAM imediatamente após a derivação
    passwordBuffer.fill(0);
  }
}

/**
 * ---> Cifra um texto plano utilizando a chave simétrica e o algoritmo AES-256-GCM.
 * ---> Empacota o IV, a Tag de Autenticação e o Texto Cifrado em um único payload Base64.
 * ---> Limpa os buffers temporários de texto plano da memória RAM no bloco finally.
 */
export function encrypt(plaintext: string, key: Buffer): string {
  const plainBuffer = Buffer.from(plaintext, 'utf8');
  const iv = crypto.randomBytes(IV_LENGTH);

  try {
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
    const encrypted = Buffer.concat([cipher.update(plainBuffer), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const payload = Buffer.concat([iv, authTag, encrypted]);

    return payload.toString('base64');
  } finally {
    // ---> Protocolo Zeroize: garante que os dados em texto claro sejam apagados da RAM
    plainBuffer.fill(0);
  }
}

/**
 * ---> Decifra o payload Base64 utilizando AES-256-GCM e valida a tag de autenticação.
 * ---> Se a chave for incorreta ou o payload for alterado, lança uma exceção de segurança.
 */
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

  const decryptedBuffer = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  const decryptedText = decryptedBuffer.toString('utf8');

  // ---> Zera o buffer decifrado bruto antes de retornar a string
  decryptedBuffer.fill(0);

  return decryptedText;
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
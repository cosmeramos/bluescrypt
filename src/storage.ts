import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

interface VaultSchema {
  salt: string;
  payload: string;
}

/**
 * ---> Retorna o caminho absoluto do cofre global (`~/.bluescrypt/vault.json`).
 * ---> Cria o diretório oculto com permissões restritas caso não exista.
 */
function getVaultFilePath(): string {
  const userHome = os.homedir();
  const vaultDir = path.join(userHome, '.bluescrypt');

  if (!fs.existsSync(vaultDir)) {
    fs.mkdirSync(vaultDir, { recursive: true, mode: 0o700 });
  }

  return path.join(vaultDir, 'vault.json');
}

/**
 * ---> Carrega o arquivo de cofre criptografado do diretório do usuário.
 */
export function loadVault(): { salt: Buffer; payload: string } | null {
  const filePath = getVaultFilePath();

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const parsed: VaultSchema = JSON.parse(rawData);
    return {
      salt: Buffer.from(parsed.salt, 'base64'),
      payload: parsed.payload,
    };
  } catch (error) {
    throw new Error('Falha ao ler o arquivo do cofre. O arquivo pode estar inacessível ou corrompido.');
  }
}

/**
 * ---> Salva atomicamente o cofre criptografado no diretório global do usuário.
 */
export function saveVault(salt: Buffer, payload: string): void {
  const filePath = getVaultFilePath();
  const data: VaultSchema = {
    salt: salt.toString('base64'),
    payload: payload,
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), {
    encoding: 'utf8',
    mode: 0o600
  });
}
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VAULT_FILE = path.join(__dirname, '..', 'vault.bluescrypt');

interface VaultFormat {
    salt: string;   
    payload: string; 
}

export function saveVault(salt: Buffer, encryptedPayload: Buffer): void {
    const data: VaultFormat = {
        salt: salt.toString('hex'),
        payload: encryptedPayload.toString('hex'),
    };
    fs.writeFileSync(VAULT_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export function loadVault(): { salt: Buffer; payload: Buffer } | null {
    if (!fs.existsSync(VAULT_FILE)) {
        return null;
    }
    const rawData = fs.readFileSync(VAULT_FILE, 'utf8');
    const parsed: VaultFormat = JSON.parse(rawData);

    return {
        salt: Buffer.from(parsed.salt, 'hex'),
        payload: Buffer.from(parsed.payload, 'hex'),
    };
}
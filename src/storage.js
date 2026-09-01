import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const currentFilename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const VAULT_FILE = path.join(__dirname, '..', 'vault.bluescrypt');
export function saveVault(salt, encryptedPayload) {
    const data = {
        salt: salt.toString('hex'),
        payload: encryptedPayload.toString('hex'),
    };
    fs.writeFileSync(VAULT_FILE, JSON.stringify(data, null, 2), 'utf8');
}
export function loadVault() {
    if (!fs.existsSync(VAULT_FILE)) {
        return null;
    }
    const rawData = fs.readFileSync(VAULT_FILE, 'utf8');
    const parsed = JSON.parse(rawData);
    return {
        salt: Buffer.from(parsed.salt, 'hex'),
        payload: Buffer.from(parsed.payload, 'hex'),
    };
}
//# sourceMappingURL=storage.js.map
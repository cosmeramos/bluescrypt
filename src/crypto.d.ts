export declare function generateSalt(): Buffer;
export declare function deriveKey(password: string, salt: Buffer): Buffer;
export declare function encrypt(plaintext: string, key: Buffer): Buffer;
export declare function decrypt(payload: Buffer, key: Buffer): string;
export declare function generateStrongPassword(length?: number): string;
//# sourceMappingURL=crypto.d.ts.map
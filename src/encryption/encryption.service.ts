import { scrypt, randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EncryptionService {
  private readonly keylen = 64;

  async hash(password: string) {
    const salt = randomBytes(8).toString('hex');

    const hashed = await this.scryptFn(password, salt, this.keylen);
    return `${hashed.toString('hex')}.${salt}`;
  }

  async compare(given: string, stored: string): Promise<boolean> {
    const [hash, salt] = stored.split('.');

    const givenHash = await this.scryptFn(given, salt, this.keylen);
    return hash === givenHash.toString('hex');
  }

  private scryptFn(
    password: string,
    salt: string,
    keylen: number,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) =>
      scrypt(password, salt, keylen, (err, derivedKey) =>
        err ? reject(err) : resolve(derivedKey),
      ),
    );
  }
}

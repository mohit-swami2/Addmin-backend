import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keysDir = path.join(__dirname, '../../../keys');

let privateKey;
let publicKey;

const normalizePem = (value) => value.replace(/\\n/g, '\n');

export const loadJwtKeys = () => {
  if (!privateKey) {
    if (process.env.JWT_PRIVATE_KEY && process.env.JWT_PUBLIC_KEY) {
      privateKey = normalizePem(process.env.JWT_PRIVATE_KEY);
      publicKey = normalizePem(process.env.JWT_PUBLIC_KEY);
    } else {
      privateKey = fs.readFileSync(path.join(keysDir, 'jwt.key'), 'utf8');
      publicKey = fs.readFileSync(path.join(keysDir, 'jwt.key.pub'), 'utf8');
    }
  }
  return { privateKey, publicKey };
};

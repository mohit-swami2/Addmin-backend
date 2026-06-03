import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keysDir = path.join(__dirname, '../../../keys');

let privateKey;
let publicKey;

export const loadJwtKeys = () => {
  if (!privateKey) {
    privateKey = fs.readFileSync(path.join(keysDir, 'jwt.key'), 'utf8');
    publicKey = fs.readFileSync(path.join(keysDir, 'jwt.key.pub'), 'utf8');
  }
  return { privateKey, publicKey };
};

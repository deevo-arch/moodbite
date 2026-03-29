const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const VAULT_FILE = 'secrets.vault';
const FILES_TO_VAULT = [
  { src: '.env', dest: '.env' },
  { src: 'prisma/dev.db', dest: 'prisma/dev.db' },
  { src: 'Creds.txt', dest: 'Creds.txt' } // Optional but helpful
];

const algorithm = 'aes-256-cbc';
const ivLength = 16;

function getPassword() {
  const pwd = process.argv[3];
  if (!pwd) {
    console.error('Error: Please provide a password as the second argument.');
    process.exit(1);
  }
  return crypto.createHash('sha256').update(pwd).digest();
}

function encrypt() {
  const password = getPassword();
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, password, iv);

  const payload = {};
  for (const file of FILES_TO_VAULT) {
    const fullPath = path.resolve(file.src);
    if (fs.existsSync(fullPath)) {
      payload[file.dest] = fs.readFileSync(fullPath).toString('base64');
      console.log(`+ Added ${file.dest} to vault`);
    } else {
      console.warn(`! Skipping ${file.dest} (not found)`);
    }
  }

  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final()
  ]);

  const output = Buffer.concat([iv, ciphertext]);
  fs.writeFileSync(VAULT_FILE, output);
  console.log(`\nSuccess: ${VAULT_FILE} created.`);
}

function decrypt() {
  const password = getPassword();
  if (!fs.existsSync(VAULT_FILE)) {
    console.error(`Error: ${VAULT_FILE} not found.`);
    process.exit(1);
  }

  const input = fs.readFileSync(VAULT_FILE);
  const iv = input.slice(0, ivLength);
  const ciphertext = input.slice(ivLength);

  try {
    const decipher = crypto.createDecipheriv(algorithm, password, iv);
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);

    const payload = JSON.parse(decrypted.toString('utf8'));
    for (const [dest, content] of Object.entries(payload)) {
      const fullPath = path.resolve(dest);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(fullPath, Buffer.from(content, 'base64'));
      console.log(`- Restored ${dest}`);
    }
    console.log('\nSuccess: Environment unlocked.');
  } catch (err) {
    console.error('Error: Decryption failed. Please check your password.');
    process.exit(1);
  }
}

const command = process.argv[2];
if (command === 'encrypt') encrypt();
else if (command === 'decrypt') decrypt();
else {
  console.log('Usage: node scripts/vault.js [encrypt|decrypt] <password>');
}

import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('Usage: pnpm hash:password "<password>"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\nHash generado:\n');
console.log(hash);
console.log('\nPegalo en .env como ADMIN_PASSWORD_HASH=<hash>\n');
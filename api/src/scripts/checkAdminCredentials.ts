import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

const password = process.argv[2];

if (!password) {
  console.error('Uso: pnpm check:admin "<password>"');
  process.exit(1);
}

console.log('\n[check-admin] Diagnóstico de credenciales\n');
console.log('  ADMIN_EMAIL configurado:');
console.log(`    "${env.ADMIN_EMAIL}"`);
console.log('');
console.log('  ADMIN_PASSWORD_HASH configurado:');
console.log(`    "${env.ADMIN_PASSWORD_HASH}"`);
console.log(`    Longitud: ${env.ADMIN_PASSWORD_HASH.length}`);
console.log(`    Prefijo: ${env.ADMIN_PASSWORD_HASH.slice(0, 7)}`);
console.log('');
console.log('  Contraseña a probar:');
console.log(`    "${password}"`);
console.log('');

const looksValid =
  env.ADMIN_PASSWORD_HASH.length === 60 &&
  /^\$2[aby]\$\d{2}\$/.test(env.ADMIN_PASSWORD_HASH);

console.log(
  `  El hash parece un bcrypt válido: ${looksValid ? 'SÍ' : 'NO'}`,
);
console.log('');

if (!looksValid) {
  console.log(
    '  → El hash en .env no tiene el formato correcto (deberían ser 60 caracteres y empezar con $2a$10$, $2b$10$, etc.).',
  );
  console.log('    Regeneralo con: pnpm hash:password "tuContraseña"');
  process.exit(1);
}

const matches = bcrypt.compareSync(password, env.ADMIN_PASSWORD_HASH);

console.log(`  ¿La contraseña coincide con el hash?: ${matches ? 'SÍ ✓' : 'NO ✗'}`);
console.log('');

if (matches) {
  console.log('  El back acepta estas credenciales. Si el front falla, revisá:');
  console.log('    - Que estés escribiendo EXACTAMENTE el mismo email (mayúsculas/minúsculas no importan).');
  console.log('    - Que no haya espacios extra al copiar/pegar.');
} else {
  console.log('  Problemas posibles:');
  console.log('    1. El hash fue generado con OTRA contraseña.');
  console.log('       → Regenerá: pnpm hash:password "laContraseñaQueVasAUsar"');
  console.log('       → Pegá el resultado en ADMIN_PASSWORD_HASH del .env (sin comillas).');
  console.log('       → Reiniciá pnpm dev.');
  console.log('');
  console.log('    2. El hash en .env se corrompió al copiar/pegar.');
  console.log('       → Debe tener exactamente 60 caracteres, sin espacios ni saltos de línea.');
  console.log('       → Si la consola de tu editor lo partió en varias líneas, juntalo en una.');
  console.log('');
  console.log('    3. Hay comillas alrededor del hash en el .env.');
  console.log('       → Debe ser: ADMIN_PASSWORD_HASH=$2a$10$...');
  console.log('       → NO: ADMIN_PASSWORD_HASH="$2a$10$..."');
}

process.exit(matches ? 0 : 1);
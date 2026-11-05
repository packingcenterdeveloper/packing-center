import { env } from '../config/env.js';
import { getTransporter } from '../config/mailer.js';

async function main() {
  console.log('=== INICIANDO PRUEBA DE CORREO ===');
  
  const to = process.argv[2] || env.MAIL_TO;
  if (!to) {
    console.error('❌ ERROR: No se especificó destinatario y MAIL_TO está vacío.');
    process.exit(1);
  }

  console.log(`📧 Destinatario: ${to}`);
  console.log(`📧 Remitente: ${env.MAIL_USER}`);
  console.log(`📧 Host: ${env.MAIL_HOST}:${env.MAIL_PORT} (Secure: ${env.MAIL_SECURE})`);

  const transporter = getTransporter();
  if (!transporter) {
    console.error('❌ ERROR: No se pudo crear el transporter. Revisá MAIL_USER y MAIL_PASS en el .env');
    process.exit(1);
  }

  try {
    console.log('⏳ Conectando con el servidor SMTP...');
    
    // Forzamos la verificación de conexión (handshake)
    await transporter.verify();
    console.log('✅ Conexión SMTP exitosa. Credenciales correctas.');

    console.log('⏳ Enviando mail de prueba...');
    const info = await transporter.sendMail({
      from: `"${env.MAIL_FROM_NAME}" <${env.MAIL_USER}>`,
      to,
      subject: '🧪 Prueba de PackingCenter',
      text: 'Este es un correo de prueba enviado desde el script de QA de PackingCenter. Si lo ves, la configuración de Gmail funciona perfecto.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🧪 Prueba de Correo</h2>
          <p>Este es un correo de prueba enviado desde el script de QA de <strong>PackingCenter</strong>.</p>
          <p>Si estás leyendo esto, la configuración de Gmail funciona perfecto y estamos listos para producción.</p>
        </div>
      `,
    });

    console.log(`✅ Mail enviado. ID: ${info.messageId}`);
    console.log('=== PRUEBA FINALIZADA CON ÉXITO ===');
  } catch (error) {
    console.error('❌ ERROR ENVIANDO EL MAIL:');
    console.error(error);
    process.exit(1);
  }
}

main();
import { mailSender } from '../src/config/mail.js';

async function run() {
  try {
    const testRecipient = process.argv[2];
    if (!testRecipient) {
      console.error('Please provide a test recipient email address.');
      console.error('Usage: node scripts/test-mail.js <email>');
      process.exit(1);
    }
    
    console.log(`Attempting to send a test email to: ${testRecipient}`);
    
    const info = await mailSender.sendEmail({
      to: testRecipient,
      subject: '[Test Mail] Verify SMTP Mailer',
      text: 'This is a test email sent from the application to verify real SMTP mail sender functionality.',
    });
    
    console.log('Test email sent successfully!');
    console.log('Response info:', info);
    process.exit(0);
  } catch (error) {
    console.error('Failed to send test email:', error);
    process.exit(1);
  }
}

run();

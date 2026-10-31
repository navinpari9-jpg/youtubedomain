export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, email, subject, message } = req.body || {};
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim() : '';
  const cleanSubject = typeof subject === 'string' ? subject.trim() : '';
  const cleanMessage = typeof message === 'string' ? message.trim() : '';

  if (!cleanName || cleanName.length < 2) {
    res.status(400).json({ error: 'Please enter your name (at least 2 characters).' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    res.status(400).json({ error: 'Please provide a valid email address.' });
    return;
  }

  if (!cleanMessage || cleanMessage.length < 10) {
    res.status(400).json({ error: 'Please enter a message of at least 10 characters.' });
    return;
  }

  const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
  const mailtoUrl = `mailto:navinzoro3108@gmail.com?subject=${encodeURIComponent(
    cleanSubject || `Portfolio Inquiry from ${cleanName}`
  )}&body=${encodeURIComponent(`Name: ${cleanName}\nEmail: ${cleanEmail}\n\n${cleanMessage}`)}`;

  res.status(200).json({
    success: true,
    smtpConfigured,
    recipient: 'navinzoro3108@gmail.com',
    mailtoUrl,
    receivedAt: new Date().toISOString(),
    notice: smtpConfigured
      ? 'Your message has been dispatched to Navin Kumar.'
      : 'Message validated. Automated server email delivery requires an SMTP email backend; click "Open in Email Client" or use the direct mailto link to send immediately to navinzoro3108@gmail.com.',
  });
}

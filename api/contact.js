import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    // Vercel fournit req.body quand on envoie du JSON
    const data = req.body || {};

    const { website_trap, firstName, lastName, email, phone, date, message } =
      data;

    // Honeypot
    if (website_trap) {
      return res.status(200).json({ ok: true });
    }

    const subject = `Nouveau contact — ${firstName || ''} ${lastName || ''}`;
    const safeMessage = (message || '').replace(/</g, '&lt;');

    const html = `
      <h2>Nouveau message depuis le site Les 3 Sœurs</h2>
      <p><strong>Nom :</strong> ${firstName || ''} ${lastName || ''}</p>
      <p><strong>Email :</strong> ${email || ''}</p>
      <p><strong>Téléphone :</strong> ${phone || ''}</p>
      <p><strong>Date :</strong> ${date || ''}</p>
      <p><strong>Message :</strong></p>
      <p style="white-space:pre-wrap">${safeMessage}</p>
    `;

    await resend.emails.send({
      from: process.env.CONTACT_FROM,
      to: [process.env.CONTACT_TO],
      subject,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false });
  }
}

import { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_OWNER || 'Rotha-101';
const REPO = process.env.GITHUB_REPO || 'CHEA_ROTHA';
const BRANCH = 'main';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { name, senderEmail, message, recipientEmail } = req.body;

    // Validate input fields
    if (!name || !senderEmail || !message || !recipientEmail) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!GITHUB_TOKEN) {
        return res.status(500).json({
            error: 'GITHUB_TOKEN is missing in environment variables',
            help: 'Go to Vercel Settings > Environment Variables and add GITHUB_TOKEN'
        });
    }

    try {
        // 1. Fetch settings from db.json on GitHub
        const getRes = await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/contents/db.json?ref=${BRANCH}`,
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                    'User-Agent': 'Portfolio-CMS'
                },
            }
        );

        if (!getRes.ok) {
            const err = await getRes.json();
            return res.status(getRes.status).json({ error: 'GitHub Read Error', details: err });
        }

        const fileData = await getRes.json();
        const db = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
        const settings = db.settings || {};

        const gmailUser = settings.gmailUser;
        const gmailPass = settings.gmailPass;

        if (!gmailUser || !gmailPass) {
            return res.status(503).json({
                error: 'Email configuration not set up',
                details: 'Gmail credentials are not configured in Admin > Settings.'
            });
        }

        // 2. Setup NodeMailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmailUser,
                pass: gmailPass
            },
        });

        // 3. Prepare Email
        const sanitizedMessage = message.replace(/[<>]/g, (char: string) => ({ '<': '&lt;', '>': '&gt;' }[char as keyof any] || char));
        
        const mailOptions = {
            from: `"${name}" <${gmailUser}>`,
            replyTo: senderEmail,
            to: recipientEmail,
            subject: `New Contact Message from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <div style="background-color: #ff4d4d; padding: 20px; border-radius: 8px 8px 0 0; margin-bottom: 20px;">
                        <h2 style="color: white; margin: 0; font-size: 20px;">New Message from Portfolio</h2>
                    </div>
                    <div style="padding: 0 10px;">
                        <p style="margin-bottom: 10px;"><strong>From:</strong> ${name}</p>
                        <p style="margin-bottom: 20px;"><strong>Email:</strong> ${senderEmail}</p>
                        <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #ff4d4d; border-radius: 4px; margin-bottom: 20px;">
                            <p style="white-space: pre-wrap; margin: 0; color: #374151;">${sanitizedMessage}</p>
                        </div>
                    </div>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p style="color: #9ca3af; font-size: 11px; text-align: center; margin: 0;">Sent via Portfolio CMS • ${new Date().toLocaleString()}</p>
                </div>
            `,
            text: `New Message from Your Portfolio\n\nFrom: ${name} (${senderEmail})\n\n${sanitizedMessage}`,
        };

        // 4. Send Email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: 'Email sent successfully!'
        });

    } catch (error: any) {
        console.error('Email Error:', error);
        return res.status(500).json({ 
            error: 'Internal Server Error', 
            message: error.message,
            details: 'Make sure your Gmail App Password is correct and GITHUB_TOKEN is set.'
        });
    }
}

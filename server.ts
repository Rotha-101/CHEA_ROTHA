import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { JSONFilePreset } from 'lowdb/node';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize lowdb database
const defaultData = { profile: {}, skills: [], projects: [], experience: [], education: [], settings: {}, blog: [], activity_logs: [], stats: [] };
let db: any;

async function initDB() {
  db = await JSONFilePreset('db.json', defaultData);
}
initDB();

const app = express();
const PORT = 3001;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// Friendly root route so browser open on API port is not confusing.
app.get('/', (_req, res) => {
  res.status(200).send('API server is running. Use /api/* endpoints. Frontend dev server runs on port 5173.');
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// API: List all media
app.get('/api/media', (req, res) => {
  const host = req.get('host') || `localhost:${PORT}`;
  
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to scan directory' });
    }
    
    const mediaFiles = files.map(file => {
      const isImage = file.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
      const isDoc = file.match(/\.(pdf|doc|docx)$/i);
      return {
        name: file,
        url: `http://${host}/uploads/${file}`,
        path: file,
        type: isImage ? 'image' : isDoc ? 'document' : 'other'
      };
    });
    
    res.json(mediaFiles);
  });
});

// API: Upload file
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const host = req.get('host') || `localhost:${PORT}`;
  const file = req.file;
  const isImage = file.filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
  const isDoc = file.filename.match(/\.(pdf|doc|docx)$/i);
  
  res.json({
    name: file.filename,
    url: `http://${host}/uploads/${file.filename}`,
    path: file.filename,
    type: isImage ? 'image' : isDoc ? 'document' : 'other'
  });
});

// API: Delete file
app.delete('/api/media/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);
  
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) return res.status(500).json({ error: 'Failed to delete file' });
      res.json({ success: true });
    });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// JSON API: GET collection
app.get('/api/db/:collection', async (req, res) => {
  if (!db) await initDB();
  await db.read();
  const coll = req.params.collection;
  res.json(db.data[coll] || []);
});

// JSON API: POST/PUT update data
app.post('/api/db/:collection', async (req, res) => {
  if (!db) await initDB();
  const coll = req.params.collection;
  db.data[coll] = req.body;
  await db.write();
  res.json({ success: true, data: db.data[coll] });
});

// API: Send contact email via Gmail
app.post('/api/send-email', async (req, res) => {
  const { name, senderEmail, message, recipientEmail } = req.body;
  
  // Validate input fields
  if (!name || !senderEmail || !message || !recipientEmail) {
    return res.status(400).json({ error: 'Missing required fields: name, email, message, and recipient email are all required.' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(senderEmail)) {
    return res.status(400).json({ error: 'Invalid sender email format.' });
  }

  if (!emailRegex.test(recipientEmail)) {
    return res.status(400).json({ error: 'Invalid recipient email format.' });
  }

  try {
    // Read Gmail credentials from db settings
    if (!db) await initDB();
    await db.read();
    const settings = db.data.settings || {};
    const gmailUser = settings.gmailUser || process.env.GMAIL_USER;
    const gmailPass = settings.gmailPass || process.env.GMAIL_PASS;

    if (!gmailUser || !gmailPass) {
      return res.status(503).json({ 
        error: 'Email configuration not set up',
        details: 'Gmail credentials are not configured. Please go to Admin > Settings and enter your Gmail address and 16-digit Gmail App Password.'
      });
    }

    // Validate Gmail credentials format
    if (!gmailUser.includes('@gmail.com')) {
      return res.status(503).json({ 
        error: 'Invalid Gmail address',
        details: 'Please ensure your Gmail address ends with @gmail.com in Admin > Settings.'
      });
    }

    if (gmailPass.length < 16) {
      return res.status(503).json({ 
        error: 'Invalid Gmail App Password',
        details: 'Gmail App Password must be 16 digits. Get it from https://myaccount.google.com/apppasswords'
      });
    }

    // Create transporter with enhanced error handling
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { 
        user: gmailUser, 
        pass: gmailPass 
      },
    });

    // Test connection before sending
    await transporter.verify().catch((err) => {
      console.error('Gmail connection verification failed:', err.message);
      throw new Error('Failed to connect to Gmail. Check your credentials and ensure 2-Step Verification is enabled.');
    });

    // Sanitize message to prevent HTML injection
    const sanitizedMessage = message.replace(/[<>]/g, (char) => ({'<': '&lt;', '>': '&gt;'}[char] || char));

    const mailOptions = {
      from: `"${name}" <${gmailUser}>`,
      replyTo: senderEmail,
      to: recipientEmail,
      subject: `New Contact Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #d97706; margin-top: 0;">New Message from Your Portfolio</h2>
          </div>
          <div style="margin-bottom: 20px;">
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${senderEmail}</p>
          </div>
          <div style="background-color: #fafafa; padding: 15px; border-left: 4px solid #d97706; border-radius: 4px; margin-bottom: 20px;">
            <p style="white-space: pre-wrap; margin: 0; color: #1f2937;">${sanitizedMessage}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">Sent via your Portfolio CMS contact form at ${new Date().toLocaleString()}</p>
        </div>
      `,
      text: `New Message from Your Portfolio\n\nFrom: ${name} (${senderEmail})\n\n${sanitizedMessage}\n\nSent via your Portfolio CMS contact form.`,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log successful email send
    console.log('Email sent successfully:', info.messageId);

    res.json({ 
      success: true, 
      message: 'Email sent successfully! I will get back to you soon.',
      messageId: info.messageId 
    });
  } catch (error: any) {
    console.error('Email send error:', error);
    
    // Provide specific error messages based on error type
    let userMessage = 'Failed to send email. Please try again later.';
    
    if (error.message.includes('authentication') || error.message.includes('Invalid login')) {
      userMessage = 'Gmail authentication failed. Please verify your Gmail address and 16-digit Gmail App Password in Admin > Settings.';
    } else if (error.message.includes('connect')) {
      userMessage = 'Cannot connect to Gmail. Please check your internet connection or try again later.';
    } else if (error.message.includes('2-Step')) {
      userMessage = 'Ensure 2-Step Verification is enabled on your Gmail account and you\'re using a valid App Password.';
    }

    res.status(500).json({ 
      error: userMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Media & Database Server running at http://localhost:${PORT}`);
});


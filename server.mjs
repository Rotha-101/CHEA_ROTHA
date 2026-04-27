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

const defaultData = {
  profile: {},
  skills: [],
  projects: [],
  experience: [],
  education: [],
  references: [],
  settings: {},
  blog: [],
  activity_logs: [],
  stats: [],
  users: [],
};

let db;

async function initDB() {
  db = await JSONFilePreset('db.json', defaultData);
}
initDB();

const app = express();
const PORT = process.env.PORT || 3001;

const uploadDir = path.join(__dirname, 'uploads');
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// Google Search Console Verification Route
app.get('/googled177782dcbedd62e.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'googled177782dcbedd62e.html'));
});

// Serve static files from the Vite build directory
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

app.get('/api/media', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to scan directory' });

    const mediaFiles = files.map((file) => {
      const isImage = file.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
      const isDoc = file.match(/\.(pdf|doc|docx)$/i);
      return {
        name: file,
        url: `/uploads/${file}`,
        path: file,
        type: isImage ? 'image' : isDoc ? 'document' : 'other',
      };
    });

    res.json(mediaFiles);
  });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const file = req.file;
  const isImage = file.filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
  const isDoc = file.filename.match(/\.(pdf|doc|docx)$/i);

  res.json({
    name: file.filename,
    url: `/uploads/${file.filename}`,
    path: file.filename,
    type: isImage ? 'image' : isDoc ? 'document' : 'other',
  });
});

// ... existing API routes ...

app.get('/api/db/:collection', async (req, res) => {
  if (!db) await initDB();
  await db.read();
  const coll = req.params.collection;
  res.json(db.data[coll] || []);
});

app.post('/api/db/:collection', async (req, res) => {
  if (!db) await initDB();
  const coll = req.params.collection;
  db.data[coll] = req.body;
  await db.write();
  res.json({ success: true, data: db.data[coll] });
});

app.put('/api/db/users/:uid', async (req, res) => {
  if (!db) await initDB();
  await db.read();

  if (!Array.isArray(db.data.users)) db.data.users = [];
  const uid = req.params.uid;
  const idx = db.data.users.findIndex((u) => (u.uid || u.id) === uid);

  if (idx === -1) {
    db.data.users.push(req.body);
  } else {
    db.data.users[idx] = req.body;
  }

  await db.write();
  res.json({ success: true });
});

app.post('/api/send-email', async (req, res) => {
  const { name, senderEmail, message, recipientEmail } = req.body || {};
  if (!name || !senderEmail || !message || !recipientEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    if (!db) await initDB();
    await db.read();
    const settings = db.data.settings || {};
    const gmailUser = (settings.gmailUser || process.env.GMAIL_USER || '').trim();
    const gmailPass = (settings.gmailPass || process.env.GMAIL_PASS || '').replace(/\s+/g, '');

    if (!gmailUser || !gmailPass) {
      return res.status(503).json({ error: 'Email not configured. Set Gmail credentials in Admin > Settings.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });

    await transporter.sendMail({
      from: `"${name}" <${gmailUser}>`,
      replyTo: senderEmail,
      to: recipientEmail,
      subject: `New Contact Message from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#d97706">New Message from Your Portfolio</h2>
          <p><strong>From:</strong> ${name} (${senderEmail})</p>
          <hr style="border:1px solid #e5e7eb" />
          <p style="white-space:pre-wrap">${message}</p>
          <hr style="border:1px solid #e5e7eb" />
          <p style="color:#9ca3af;font-size:12px">Sent via your Portfolio CMS contact form.</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    const rawMessage = error?.message || 'Failed to send email';
    console.error('Email send error:', rawMessage);
    res.status(500).json({ error: rawMessage });
  }
});

// Catch-all route to serve the React app for any other request
app.get('*', (req, res) => {
  if (fs.existsSync(path.join(distDir, 'index.html'))) {
    res.sendFile(path.join(distDir, 'index.html'));
  } else {
    res.status(200).send('API server is running. Frontend build (dist folder) not found.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});


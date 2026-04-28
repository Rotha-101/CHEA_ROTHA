import { VercelRequest, VercelResponse } from '@vercel/node';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'Rotha-101';
const REPO = 'CHEA_ROTHA';
const BRANCH = 'main';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { url = '' } = req;
    const pathParts = url.split('/api/').pop()?.split('?')[0].split('/') || [];
    const collection = pathParts[0] === 'db' ? pathParts[1] : null;
    const isUpload = pathParts[0] === 'upload';

    // HANDLE GET REQUESTS (Read from GitHub or built version)
    if (req.method === 'GET') {
        if (collection) {
            try {
                const getRes = await fetch(
                    `https://api.github.com/repos/${OWNER}/${REPO}/contents/db.json?ref=${BRANCH}`,
                    {
                        headers: {
                            Authorization: `Bearer ${GITHUB_TOKEN}`,
                            Accept: 'application/vnd.github.v3+json',
                        },
                    }
                );
                if (getRes.ok) {
                    const fileData = await getRes.json();
                    const db = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
                    return res.status(200).json(db[collection] || {});
                }
            } catch (e) {
                console.error('GitHub fetch failed, falling back to local build', e);
            }
        }
        return res.status(404).json({ error: 'Not found' });
    }

    // HANDLE POST REQUESTS (Write to GitHub)
    if (req.method === 'POST') {
        if (!GITHUB_TOKEN) {
            return res.status(500).json({ error: 'GitHub Token is not configured' });
        }

        try {
            let targetPath = 'db.json';
            let newContent = '';
            let message = 'Update from Portfolio CMS';

            if (isUpload) {
                // Handle file upload (expected as multipart/form-data or body)
                // For simplicity in serverless, we expect base64 and filename in body
                const { file, filename } = req.body;
                if (!file || !filename) return res.status(400).json({ error: 'Missing file data' });
                targetPath = `uploads/${Date.now()}-${filename}`;
                newContent = file; // Base64 encoded string
                message = `Upload ${filename}`;
            } else if (collection) {
                // 1. Get existing db.json
                const getRes = await fetch(
                    `https://api.github.com/repos/${OWNER}/${REPO}/contents/db.json?ref=${BRANCH}`,
                    {
                        headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
                    }
                );
                const fileData = await getRes.json();
                const db = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));

                // 2. Update collection
                db[collection] = req.body;
                newContent = Buffer.from(JSON.stringify(db, null, 2)).toString('base64');
                message = `Update ${collection} in db.json`;
                targetPath = 'db.json';
                var sha = fileData.sha;
            } else {
                return res.status(400).json({ error: 'Invalid path' });
            }

            // Commit to GitHub
            const putRes = await fetch(
                `https://api.github.com/repos/${OWNER}/${REPO}/contents/${targetPath}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${GITHUB_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message,
                        content: newContent,
                        sha: (targetPath === 'db.json' && typeof sha !== 'undefined') ? sha : undefined,
                        branch: BRANCH,
                    }),
                }
            );

            if (!putRes.ok) throw new Error('GitHub PUT failed');

            const result = await putRes.json();
            return res.status(200).json({
                success: true,
                url: isUpload ? `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${targetPath}` : undefined,
                collection
            });

        } catch (error: any) {
            console.error('Save error:', error);
            return res.status(500).json({ error: 'Internal Server Error', message: error.message });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}

import { VercelRequest, VercelResponse } from '@vercel/node';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_OWNER || 'Rotha-101';
const REPO = process.env.GITHUB_REPO || 'CHEA_ROTHA';
const BRANCH = 'main';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { url = '' } = req;
    const pathParts = url.split('/api/').pop()?.split('?')[0].split('/') || [];
    const collection = pathParts[0] === 'db' ? pathParts[1] : null;
    const isUpload = pathParts[0] === 'upload';

    if (!GITHUB_TOKEN) {
        return res.status(500).json({
            error: 'GITHUB_TOKEN is missing in environment variables',
            help: 'Go to Vercel Settings > Environment Variables and add GITHUB_TOKEN'
        });
    }

    // HANDLE GET REQUESTS
    if (req.method === 'GET') {
        if (collection) {
            try {
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
                if (getRes.ok) {
                    const fileData = await getRes.json();
                    const db = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
                    return res.status(200).json(db[collection] || []);
                } else {
                    const err = await getRes.json();
                    return res.status(getRes.status).json({ error: 'GitHub Read Error', details: err });
                }
            } catch (e: any) {
                return res.status(500).json({ error: 'GitHub Fetch Failed', message: e.message });
            }
        }
        return res.status(404).json({ error: 'Not found' });
    }

    // HANDLE POST REQUESTS
    if (req.method === 'POST') {
        try {
            let targetPath = 'db.json';
            let newContent = '';
            let message = 'Update from Portfolio CMS';
            let sha: string | undefined;

            if (isUpload) {
                const { file, filename } = req.body;
                if (!file || !filename) return res.status(400).json({ error: 'Missing file or filename in body' });
                targetPath = `uploads/${Date.now()}-${filename}`;
                newContent = file;
                message = `Upload ${filename}`;
            } else if (collection) {
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
                    return res.status(getRes.status).json({ error: 'Could not fetch db.json from GitHub', details: err });
                }

                const fileData = await getRes.json();
                const db = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));

                db[collection] = req.body;
                newContent = Buffer.from(JSON.stringify(db, null, 2)).toString('base64');
                message = `Update ${collection} in db.json`;
                sha = fileData.sha;
            } else {
                return res.status(400).json({ error: 'Invalid API route' });
            }

            const putRes = await fetch(
                `https://api.github.com/repos/${OWNER}/${REPO}/contents/${targetPath}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${GITHUB_TOKEN}`,
                        'Content-Type': 'application/json',
                        'User-Agent': 'Portfolio-CMS'
                    },
                    body: JSON.stringify({
                        message,
                        content: newContent,
                        sha,
                        branch: BRANCH,
                    }),
                }
            );

            if (!putRes.ok) {
                const err = await putRes.json();
                return res.status(putRes.status).json({ error: 'GitHub Write Failed', details: err });
            }

            const result = await putRes.json();
            return res.status(200).json({
                success: true,
                url: isUpload ? `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${targetPath}` : undefined,
                collection
            });

        } catch (error: any) {
            return res.status(500).json({ error: 'Internal Server Error', message: error.message });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}

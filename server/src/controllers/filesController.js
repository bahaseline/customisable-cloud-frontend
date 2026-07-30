const { listFiles, getFile } = require('../services/driveService');

async function getFiles(req, res) {
  try {
    const { files, nextPageToken } = await listFiles(req.user.id, {
      pageToken: req.query.pageToken,
    });
    res.json({ files, nextPageToken });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Failed to fetch files from Google Drive' });
  }
}

async function getFileById(req, res) {
  try {
    const file = await getFile(req.user.id, req.params.fileId);
    res.json({ file });
  } catch (err) {
    if (err.code === 404) {
      return res.status(404).json({ error: 'File not found' });
    }
    console.error(err);
    res.status(502).json({ error: 'Failed to fetch file from Google Drive' });
  }
}

module.exports = { getFiles, getFileById };

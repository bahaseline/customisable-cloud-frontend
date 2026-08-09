const { listFiles, getFile, getFileContent } = require('../services/driveService');

async function getFiles(req, res) {
  const { files, nextPageToken } = await listFiles(req.user.id, {
    pageToken: req.query.pageToken,
  });
  res.json({ files, nextPageToken });
}

async function getFileById(req, res) {
  const file = await getFile(req.user.id, req.params.fileId);
  res.json({ file });
}

async function streamFileContent(req, res, next) {
  const { stream, mimeType, name } = await getFileContent(req.user.id, req.params.fileId);

  res.setHeader('Content-Type', mimeType);
  // RFC 5987 encoding
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(name)}`);

  stream.on('error', next);
  stream.pipe(res);
}

module.exports = { getFiles, getFileById, streamFileContent };

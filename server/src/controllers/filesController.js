const { listFiles, getFile, getFileContent } = require('../services/driveService');
const fileOpenService = require('../services/fileOpenService');
const { keysToCamel } = require('../utils/camelCase');

async function getFiles(req, res) {
  const { files, nextPageToken } = await listFiles(req.user.id, {
    pageToken: req.query.pageToken,
  });
  res.json({ files, nextPageToken });
}

async function getFileById(req, res) {
  const file = await getFile(req.user.id, req.params.fileId);

  fileOpenService
    .recordOpen(req.user.id, file.id, file.name)
    .catch((err) => console.error('Could not record file open:', err.message));

  res.json({ file });
}

async function getFrequentFiles(req, res) {
  const files = await fileOpenService.getFrequentFiles(req.user.id);
  res.json({ files: keysToCamel(files) });
}

async function streamFileContent(req, res, next) {
  const { stream, mimeType, name } = await getFileContent(req.user.id, req.params.fileId);

  res.setHeader('Content-Type', mimeType);
  // RFC 5987 encoding
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(name)}`);

  stream.on('error', next);
  stream.pipe(res);
}

module.exports = { getFiles, getFileById, getFrequentFiles, streamFileContent };

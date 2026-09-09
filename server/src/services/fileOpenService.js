const { queryOne, queryRows } = require('../db');

// Records that a user opened a file. If the user has opened it before, increments the count and updates the last-opened timestamp; otherwise inserts a new row.
async function recordOpen(userId, driveFileId, fileName) {
  return queryOne(
    `INSERT INTO file_opens (user_id, drive_file_id, file_name)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, drive_file_id) DO UPDATE
       SET open_count = file_opens.open_count + 1,
           last_opened_at = NOW(),
           file_name = COALESCE(EXCLUDED.file_name, file_opens.file_name)
     RETURNING drive_file_id, open_count`,
    [userId, driveFileId, fileName]
  );
}

// Returns the most frequently opened files for a user, ordered by open count and last opened timestamp.
async function getFrequentFiles(userId, limit = 20) {
  return queryRows(
    `SELECT drive_file_id, file_name, open_count, last_opened_at
     FROM file_opens
     WHERE user_id = $1
     ORDER BY open_count DESC, last_opened_at DESC
     LIMIT $2`,
    [userId, limit]
  );
}

module.exports = { recordOpen, getFrequentFiles };

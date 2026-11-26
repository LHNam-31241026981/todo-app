const http = require('node:http');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync(join(__dirname, 'todo.sqlite'));
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 120),
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK(status IN ('pending', 'doing', 'done')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) STRICT
`);
const home = readFileSync(join(__dirname, 'index.html'));
const list = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC, id DESC');
const find = db.prepare('SELECT * FROM tasks WHERE id = ?');
const insert = db.prepare('INSERT INTO tasks(title) VALUES (?) RETURNING *');
const update = db.prepare('UPDATE tasks SET title = ?, status = ? WHERE id = ? RETURNING *');
const remove = db.prepare('DELETE FROM tasks WHERE id = ?');
const counts = db.prepare('SELECT status, COUNT(*) AS total FROM tasks GROUP BY status');

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

async function body(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size <= 8192) chunks.push(chunk);
  }
  if (size > 8192) return null;
  try {
    const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    return data && typeof data === 'object' && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;
    if (req.method === 'GET' && path === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(home);
    }
    if (req.method === 'GET' && path === '/api/tasks') return json(res, 200, list.all());
    if (req.method === 'GET' && path === '/api/stats') {
      const stats = { pending: 0, doing: 0, done: 0, total: 0 };
      for (const row of counts.all()) {
        stats[row.status] = row.total;
        stats.total += row.total;
      }
      return json(res, 200, stats);
    }

    const match = /^\/api\/tasks\/(\d+)$/.exec(path);
    const creating = req.method === 'POST' && path === '/api/tasks';
    const editing = req.method === 'PATCH' && match;
    if (creating || editing) {
      const data = await body(req);
      if (!data) return json(res, 400, { error: 'Dữ liệu gửi lên không hợp lệ.' });
      const current = editing ? find.get(Number(match[1])) : null;
      if (editing && !current) return json(res, 404, { error: 'Không tìm thấy công việc.' });
      const title = Object.hasOwn(data, 'title') ? data.title : current?.title;
      const status = Object.hasOwn(data, 'status') ? data.status : current?.status;
      if (typeof title !== 'string' || !title.trim() || title.trim().length > 120) {
        return json(res, 400, { error: 'Tên công việc phải có từ 1 đến 120 ký tự.' });
      }
      if (editing && !['pending', 'doing', 'done'].includes(status)) {
        return json(res, 400, { error: 'Trạng thái không hợp lệ.' });
      }
      return creating
        ? json(res, 201, insert.get(title.trim()))
        : json(res, 200, update.get(title.trim(), status, current.id));
    }
    if (match && req.method === 'DELETE') {
      if (remove.run(Number(match[1])).changes) return json(res, 200, { deleted: true });
    }
    return json(res, 404, { error: 'Không tìm thấy dữ liệu.' });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: 'Không thể xử lý yêu cầu.' });
  }
});

if (require.main === module) {
  const port = Number(process.env.PORT || 8080);
  server.listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}`));
}

module.exports = server;

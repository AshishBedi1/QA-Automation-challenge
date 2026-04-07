'use strict';

const http = require('http');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 3000;

const courses = [
  { id: 'c1', title: 'Modern JavaScript Fundamentals', price: 49, hours: 12, category: 'Programming' },
  { id: 'c2', title: 'React for Web Applications', price: 79, hours: 18, category: 'Programming' },
  { id: 'c3', title: 'Node.js APIs and Services', price: 69, hours: 14, category: 'Programming' },
  { id: 'c4', title: 'TypeScript Deep Dive', price: 59, hours: 10, category: 'Programming' },
  { id: 'c5', title: 'CSS Layout and Design Systems', price: 39, hours: 8, category: 'Design' },
  { id: 'c6', title: 'Accessibility for Developers', price: 45, hours: 6, category: 'Design' },
  { id: 'c7', title: 'Python Data Analysis', price: 89, hours: 20, category: 'Data' },
  { id: 'c8', title: 'SQL for Analysts', price: 55, hours: 11, category: 'Data' },
  { id: 'c9', title: 'Docker and Containers', price: 65, hours: 9, category: 'DevOps' },
  { id: 'c10', title: 'Kubernetes Essentials', price: 95, hours: 16, category: 'DevOps' },
  { id: 'c11', title: 'AWS Cloud Practitioner', price: 75, hours: 15, category: 'Cloud' },
  { id: 'c12', title: 'Git and Collaborative Workflows', price: 29, hours: 5, category: 'Tools' },
  { id: 'c13', title: 'Testing with Jest and Playwright', price: 72, hours: 13, category: 'QA' },
  { id: 'c14', title: 'REST and GraphQL APIs', price: 58, hours: 10, category: 'Programming' },
  { id: 'c15', title: 'UI/UX Research Methods', price: 52, hours: 7, category: 'Design' },
  { id: 'c16', title: 'Machine Learning Intro', price: 110, hours: 22, category: 'Data' },
  { id: 'c17', title: 'Cybersecurity Basics', price: 68, hours: 12, category: 'Security' },
  { id: 'c18', title: 'Agile and Scrum Practices', price: 35, hours: 6, category: 'Process' },
  { id: 'c19', title: 'Technical Writing for Engineers', price: 42, hours: 5, category: 'Communication' },
  { id: 'c20', title: 'Career Skills for Developers', price: 33, hours: 4, category: 'Career' },
];

/**
 * Thumbnail paths are served by the Vite app from `client/public/thumbnails/`
 * (bundled SVGs — no external network required).
 */
function thumbnailIndex(courseId) {
  const n = parseInt(String(courseId).replace(/\D/g, ''), 10) || 0;
  return ((n - 1) % 6 + 6) % 6;
}

function courseWithImage(course) {
  const idx = thumbnailIndex(course.id);
  return {
    ...course,
    image: `/thumbnails/course-${idx}.svg`,
  };
}

function sendJson(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(data);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/api/health') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/courses') {
    sendJson(res, 200, { courses: courses.map(courseWithImage) });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/purchase') {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      let body = {};
      try {
        body = raw ? JSON.parse(raw) : {};
      } catch {
        sendJson(res, 400, { error: 'Invalid JSON' });
        return;
      }
      const courseId = body.courseId;
      const course = courses.find((c) => c.id === courseId);
      if (!course) {
        sendJson(res, 404, { error: 'Course not found' });
        return;
      }
      sendJson(res, 200, {
        ok: true,
        courseId: course.id,
        title: course.title,
        price: course.price,
      });
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] listening on 0.0.0.0:${PORT}`);
});

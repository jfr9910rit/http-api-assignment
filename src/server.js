const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const CLIENT_PATH = path.join(__dirname, '../client');

const requestHandler = (req, res) => {
  const { url, method } = req;

  if (method === 'GET' && (url === '/' || url === '/client.html')) {
    fs.readFile(path.join(CLIENT_PATH, 'client.html'), 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  if (url === '/style.css') {
    fs.readFile(path.join(CLIENT_PATH, 'style.css'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(data);
    });
    return;
  }

  let statusCode = 200;
  let statusName = '';
  let message = '';

  if (url === '/success') {
    message = 'This is a successful response';
    statusName = 'Success';
  } else if (url === '/badRequest') {
    statusCode = 400;
    message = 'Missing valid query parameter';
    statusName = 'Bad Request';
  } else if (url === '/unauthorized') {
    statusCode = 401;
    message = 'Missing loggedIn query parameter';
    statusName = 'Unauthorized';
  } else if (url === '/forbidden') {
    statusCode = 403;
    message = 'You do not have access to this content.';
    statusName = 'Forbidden';
  } else if (url === '/internal') {
    statusCode = 500;
    message = 'Internal server error occurred.';
    statusName = 'Internal Error';
  } else if (url === '/notImplemented') {
    statusCode = 501;
    message = 'Feature not implemented yet.';
    statusName = 'Not Implemented';
  } else if (url === '/notFound') {
    statusCode = 404;
    message = 'Resource not found.';
    statusName = 'Not Found';
  } else {
    statusCode = 404;
    message = 'Resource not found.';
    statusName = 'Not Found';
  }

  fs.readFile(path.join(CLIENT_PATH, 'client.html'), 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Internal Server Error');
      return;
    }

    const modifiedHtml = data
      .replace('<option value="/success"', `<option value="/success" ${url === '/success' ? 'selected' : ''}`)
      .replace('<option value="/badRequest"', `<option value="/badRequest" ${url === '/badRequest' ? 'selected' : ''}`)
      .replace('<option value="/unauthorized"', `<option value="/unauthorized" ${url === '/unauthorized' ? 'selected' : ''}`)
      .replace('<option value="/forbidden"', `<option value="/forbidden" ${url === '/forbidden' ? 'selected' : ''}`)
      .replace('<option value="/internal"', `<option value="/internal" ${url === '/internal' ? 'selected' : ''}`)
      .replace('<option value="/notImplemented"', `<option value="/notImplemented" ${url === '/notImplemented' ? 'selected' : ''}`)
      .replace('<option value="/notFound"', `<option value="/notFound" ${url === '/notFound' || statusCode === 404 ? 'selected' : ''}`)
      .replace('<option value="application/json"', '<option value="application/json" selected')
      .replace('</body>', `
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const responseDiv = document.getElementById('content');
            responseDiv.innerHTML = \`
              <h2>${statusName}</h2>
              <p>${message}</p>
            \`;
          });
        </script>
      </body>`);

    const acceptHeader = req.headers.accept || 'text/html';

    if (acceptHeader.includes('application/json')) {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: statusName, message }));
    } else if (acceptHeader.includes('text/xml')) {
      const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
        <response>
          <status>${statusName}</status>
          <message>${message}</message>
        </response>`;

      res.writeHead(statusCode, { 'Content-Type': 'text/xml' });
      res.end(xmlResponse);
    } else {
      res.writeHead(statusCode, { 'Content-Type': 'text/html' });
      res.end(modifiedHtml);
    }
  });
};

const server = http.createServer(requestHandler);
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

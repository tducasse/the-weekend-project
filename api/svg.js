const https = require('https');
const URL = `https://img.shields.io/badge/weekend--project-what's%20this%3F-blue?link=&link=https://github.com/tducasse/the-weekend-project`;


const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  res.setHeader('Content-Type', 'image/svg+xml');
  return await fn(req, res)
}

const handler = (req, res) => {
  https.get(URL, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      res.send(data);
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

module.exports = allowCors(handler)


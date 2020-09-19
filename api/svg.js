const https = require('https');
const URL = `https://img.shields.io/badge/weekend--project-what's%20this%3F-blue?link=&link=https://github.com/tducasse/the-weekend-project`;

module.exports = (req, res) => {
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
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit(
  { auth: process.env.OAUTH_GITHUB }
);

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
  return await fn(req, res)
}

const getRepos = (data) => {
  const repos = [];
  for (repo in data) {
    const name = repo.full_name;

  }
}

const handler = async (req, res) => {
  if (!req.query || !req.query.user) {
    res.status(400);
    res.send('ERROR: no user');
  }

  const repos = await octokit.repos.listForUser({
    type: "owner",
    sort: "updated",
    direction: 'desc',
    per_page: 100,
    username: req.query.user,
  });

  res.send(JSON.stringify(repos.map(repo => repo.full_name)))
}

module.exports = allowCors(handler)


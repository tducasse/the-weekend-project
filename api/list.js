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

const handler = async (req, res) => {
  const { user } = req.query
  if (!user) {
    res.status(400);
    res.send('ERROR: no user');
  }

  const response = await octokit.repos.listForUser({
    username: user,
    type: "owner",
    sort: "updated",
    direction: 'desc',
    per_page: 100,
  });

  const repos = (response.data || []).map(repo => repo.name)

  const readmes = await Promise.all(
    repos.map(
      async repo => {
        try {
          return octokit.repos.getReadme({
            owner: user,
            repo,
          });
        } catch (e) {
          return false;
        }
      }
    ).filter(Boolean)
  )


  res.send(readmes[0])
}

module.exports = allowCors(handler)


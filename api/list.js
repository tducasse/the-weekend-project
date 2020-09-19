const { Octokit } = require("@octokit/rest");
const octokit = new Octokit(
  { auth: process.env.OAUTH_GITHUB, userAgent: "the-weekend-project" }
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

const getWeekendProjects = (readmes) => {
  const repos = [];
  readmes.forEach(
    readme => {
      const data = readme.result && readme.result.data;
      if (!data) {
        return false;
      }
      if (data.indexOf('![weekend-project](https://the-weekend-project.vercel.app/api/svg)]') < 0) {
        return false;
      }
      repos.push(`- [${readme.repo.name}](${readme.repo.url})`);
    }
  );
  return repos.join('\n');
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

  const repos = (response.data || []).map(repo => ({ name: repo.name, url: repo.html_url }))

  const readmes = await Promise.all(
    repos.map(
      repo =>
        octokit.repos.getReadme({
          owner: user,
          repo: repo.name,
          headers: {
            "Accept": "application/vnd.github.v3.raw"
          }
        }).then((result) => ({ result, repo })).catch(() => false)
    )
  )

  res.send(getWeekendProjects(readmes));
}

module.exports = allowCors(handler)


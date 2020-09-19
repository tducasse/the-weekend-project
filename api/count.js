const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.OAUTH_GITHUB,
  userAgent: "the-weekend-project",
});

const allowCors = (fn) => async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  res.setHeader("Content-Type", "image/svg+xml");
  return await fn(req, res);
};

const countWeekendProjects = (readmes) => {
  let count = 0;
  readmes.forEach((readme) => {
    const data = readme.result && readme.result.data;
    if (!data) {
      return false;
    }
    if (
      data.indexOf(
        "![weekend-project](https://the-weekend-project.vercel.app/api/svg)]"
      ) < 0
    ) {
      return false;
    }
    count = count + 1;
  });
  return count;
};

const toSVG = (number) => `<svg
  xmlns="http://www.w3.org/2000/svg"
  x="0"
  y="0"
  width="110"
  height="110"
  viewBox="0 0 110 110"
  fill="none"
>
  <rect
    x="0.5"
    y="0.5"
    rx="4.5"
    width="109"
    height="109"
    stroke="#4285f4"
    fill="#282c34"
    stroke-opacity="1"
  />

  <text
    x="50%"
    y="50"
    text-anchor="middle"
    font-family="Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji"
    font-weight="bold"
    font-size="30"
    fill="#4285f4"
  >
    ${number}
  </text>
  <text
    x="50%"
    y="80"
    text-anchor="middle"
    font-family="Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji"
    font-weight="bold"
    font-size="10"
    fill="#4285f4"
  >
    weekend project${number > 1 ? "s" : ""}
  </text>

</svg>
`;

const handler = async (req, res) => {
  const { user } = req.query;
  if (!user) {
    res.status(400);
    res.send("ERROR: no user");
  }

  const response = await octokit.repos.listForUser({
    username: user,
    type: "owner",
    sort: "updated",
    direction: "desc",
    per_page: 100,
  });

  const repos = (response.data || []).map((repo) => ({
    name: repo.name,
    url: repo.html_url,
  }));

  const readmes = await Promise.all(
    repos.map((repo) =>
      octokit.repos
        .getReadme({
          owner: user,
          repo: repo.name,
          headers: {
            Accept: "application/vnd.github.v3.raw",
          },
        })
        .then((result) => ({ result }))
        .catch(() => false)
    )
  );

  res.send(toSVG(countWeekendProjects(readmes)));
};

module.exports = allowCors(handler);

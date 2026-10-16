import { writeFileSync } from 'node:fs';

const login = process.env.LOGIN;
const token = process.env.GITHUB_TOKEN;
if (!login || !token) {
  console.error('LOGIN and GITHUB_TOKEN are required');
  process.exit(1);
}

if (!/^[A-Za-z0-9-]{1,39}$/.test(login)) { console.error('Invalid GitHub username'); process.exit(1); }

const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount contributionLevel}}}}}}`;

const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'contribution-animations',
  },
  body: JSON.stringify({ query, variables: { login } }),
});
if (!res.ok) { console.error(`GitHub API returned ${res.status}`); process.exit(1); }

const json = await res.json();
const weeks = json.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
if (!weeks) { console.error(JSON.stringify(json.errors ?? json)); process.exit(1); }

const LEVELS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
const data = {
  weeks: weeks.map((w) => ({
    days: w.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      level: LEVELS[d.contributionLevel] ?? 0,
    })),
  })),
};
writeFileSync(process.env.OUT || 'data.json', JSON.stringify(data));
console.log(`Fetched ${data.weeks.length} weeks`);
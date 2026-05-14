// Cloudflare Workers cron → GitHub workflow_dispatch.
// Replaces the `schedule:` trigger in .github/workflows/hugo.yml,
// which fires late or skips during GitHub platform incidents.

const OWNER = 'philippdubach';
const REPO = 'philippdubach.github.io';
const WORKFLOW = 'hugo.yml';
const BRANCH = 'main';

export default {
  async scheduled(event, env) {
    const endpoint = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`;
    const firedAt = new Date(event.scheduledTime).toISOString();

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.GH_PAT}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'philippdubach-build-trigger',
      },
      body: JSON.stringify({ ref: BRANCH }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[${firedAt}] dispatch failed: ${res.status} ${res.statusText}\n${body}`);
      throw new Error(`workflow_dispatch failed: ${res.status}`);
    }

    console.log(`[${firedAt}] dispatched ${OWNER}/${REPO}@${BRANCH} (${WORKFLOW})`);
  },
};

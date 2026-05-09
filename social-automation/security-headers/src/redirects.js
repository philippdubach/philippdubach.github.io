/**
 * Redirect resolver for philippdubach.com.
 *
 * Three layers, evaluated in order:
 *   1. Static rename map: exact path → { status, location }
 *   2. Static gone set: exact path → 410 Gone (deleted post, no replacement)
 *   3. Pattern resolvers:
 *      - /YYYY/MM/DD/slug/  → /posts/<slug>/  (Substack-era URLs)
 *      - /page/N/           → /posts/page/N/
 *
 * Status codes:
 *   - 301 Moved Permanently for renames (Google passes link equity)
 *   - 410 Gone for deletions (cleaner than 404; tells Google "intentional")
 *
 * Returns { status, location? } or null when no redirect applies.
 *
 * Anything that returns null falls through to the existing origin-fetch flow.
 */

// Currently-existing canonical post slugs (sourced from `hugo list all` 2026-05-09).
// Used by the date-prefix resolver to verify the slug still exists before
// redirecting. If a slug isn't in this set, we 410 instead of pointing to a
// missing target.
const CURRENT_POST_SLUGS = new Set([
  "65-of-hacker-news-posts-have-negative-sentiment-and-they-outperform",
  "93-of-developers-use-ai-coding-tools.-productivity-hasnt-moved.",
  "against-all-odds-the-mathematics-of-provably-fair-casino-games",
  "agent-based-systems-for-modeling-wealth-distribution",
  "ai-can-now-design-drugs-in-seconds-we-still-cant-tell-you-if-they-work.",
  "ai-capex-arms-race-who-blinks-first",
  "ai-models-are-the-new-rebar",
  "ai-models-as-standalone-pls",
  "alphafold-3-free-for-science",
  "ambiguity-by-design",
  "apples-ai-bet-playing-the-long-game-or-missing-the-moment",
  "bandits-and-agents-netflix-and-spotify-recommender-stacks-in-2026",
  "behavioral-economics-transit-policy",
  "bet-sizing-at-the-frontier",
  "beyond-monte-carlo-tensor-based-market-modeling",
  "beyond-vector-search-why-llms-need-episodic-memory",
  "big-in-japan",
  "britains-strategic-limbo",
  "building-a-no-tracking-newsletter-from-markdown-to-distribution",
  "buying-the-haystack-might-not-work-this-year",
  "claude-opus-4.6-anthropics-new-flagship-ai-model-for-agentic-coding",
  "counting-cards-with-computer-vision",
  "crypto-mean-reversion-trading",
  "do-not-disturb-my-circles",
  "does-ai-mean-the-demand-on-labor-goes-up",
  "dont-go-monolithic-the-agent-stack-is-stratifying",
  "dual-mandate-tensions",
  "economics-of-a-super-bowl-ad",
  "enterprise-ai-strategy-is-backwards",
  "europes-24-trillion-payment-breakup-is-really-a-bet-on-infrastructure-arbitrage",
  "every-bulge-bracket-bank-agrees-on-ai",
  "everything-is-a-dcf-model",
  "f3ed-cant-call-an-ace-fixing-a-neurips-2024-tennis-model",
  "gambling-vs.-investing",
  "glp-1-receptor-agonists-in-asud-treatment",
  "how-ai-is-shaping-my-investment-portfolio-for-2026",
  "i-built-a-cgm-data-reader",
  "inside-pragma-revoluts-foundation-model-for-banking",
  "is-ai-really-eating-the-world-1/2",
  "is-ai-really-eating-the-world-agi-networks-value-2/2",
  "is-private-equity-just-beta-with-a-lockup",
  "it-just-aint-so",
  "karpathys-software-3.0-playbook",
  "long-volatility-premium",
  "mcp-vs-a2a-in-2026-how-the-ai-protocol-war-ends",
  "michael-burrys-379-newsletter",
  "modeling-glycemic-response-with-xgboost",
  "my-first-optimal-portfolio",
  "nikes-crisis-and-the-economics-of-brand-decay",
  "not-all-ai-skeptics-think-alike",
  "not-logan-roy-netflix-vs.-paramounts-bidding-war",
  "novo-nordisks-post-patent-strategy",
  "novo-was-europes-most-valuable-company",
  "on-device-ai-models-will-be-the-new-reason-to-upgrade-your-phone",
  "ozempic-is-reshaping-the-fast-food-industry",
  "passive-investings-active-problem",
  "people-live-in-levels-not-rates",
  "peter-thiels-physics-department",
  "pozsars-bretton-woods-iii-the-framework-1/2",
  "pozsars-bretton-woods-iii-three-years-later-2/2",
  "praise-by-name-criticize-by-category-warren-buffett-retires-at-95",
  "repo-might-be-even-bigger-than-we-thought",
  "rss-swipr-find-blogs-like-you-find-your-dates",
  "sentiment-trading-revisited",
  "social-media-success-prediction-bert-models-for-post-titles",
  "the-absolute-insider-mess-of-prediction-markets",
  "the-anatomy-of-a-decentralized-prediction-market-notes-from-the-polymarket-order-book",
  "the-bicycle-needs-riding-to-be-understood",
  "the-geometry-of-who-knows-what",
  "the-impossible-backhand",
  "the-last-architecture-designed-by-hand",
  "the-market-can-stay-irrational-longer-than-you-can-stay-solvent",
  "the-model-said-so",
  "the-moral-philosophy-of-investing-in-ignorance",
  "the-most-expensive-assumption-in-ai",
  "the-rise-of-middle-power-realism",
  "the-saaspocalypse-paradox",
  "the-tech-behind-this-site",
  "three-kinds-of-not-knowing",
  "trading-on-market-sentiment",
  "two-anthropics",
  "variance-tax",
  "visualizing-gradients-with-pytorch",
  "weather-forecasts-have-improved-a-lot",
  "when-ai-labs-become-defense-contractors",
  "where-mobile-money-goes-now",
  "why-lillys-weight-loss-pill-isnt-a-peptide",
  "working-with-models",
]);

// Slug renames: old slug → new slug. The old URL is /posts/<old>/ and the
// new URL is /posts/<new>/. Stored without the /posts/ prefix and trailing slash
// for compactness.
const SLUG_RENAMES = {
  // Truncated share URLs (people pasted partial URLs)
  "ai-models-are-the-=": "ai-models-are-the-new-rebar",

  // Renames from older slug to current slug
  "when-every-bulge-bracket-bank-agrees-on-ai": "every-bulge-bracket-bank-agrees-on-ai",
  "glp-1-beyond-weight-loss-the-addiction-connection": "glp-1-receptor-agonists-in-asud-treatment",
  "how-the-enterprise-ai-agent-stack-is-stratifying-in-2026": "dont-go-monolithic-the-agent-stack-is-stratifying",
  "why-netflix-and-spotify-cant-afford-smarter-recommendations": "bandits-and-agents-netflix-and-spotify-recommender-stacks-in-2026",
  "europes-24-trillion-payment-breakup": "europes-24-trillion-payment-breakup-is-really-a-bet-on-infrastructure-arbitrage",
  "the-stewart-thaler-debate-and-the-levels-vs-rates-problem": "people-live-in-levels-not-rates",
  "is-ai-really-eating-the-world": "is-ai-really-eating-the-world-1/2",
  "praise-by-name-criticize-by-category-on-the-retirement-of-warren-buffett": "praise-by-name-criticize-by-category-warren-buffett-retires-at-95",
  "41-million-insider-trading-case-that-paid-with-a-rolex-and-a-powerpoint-deck": "the-absolute-insider-mess-of-prediction-markets",
  "2026-portfolio-allocation": "how-ai-is-shaping-my-investment-portfolio-for-2026",
  "summarizing-conversation-history": "beyond-vector-search-why-llms-need-episodic-memory",
  "pozsar-bretton-woods-framework": "pozsars-bretton-woods-iii-the-framework-1/2",
  "prediction-market-insider-trading": "the-absolute-insider-mess-of-prediction-markets",
  "gambling-vs-investing": "gambling-vs.-investing",
  "ozempic-and-the-fast-food-industry": "ozempic-is-reshaping-the-fast-food-industry",
  "the-tech-behind-this-site-1": "the-tech-behind-this-site",
  "the-stewart-thaler-debate": "people-live-in-levels-not-rates",
};

// Posts that no longer exist (deleted intentionally per editorial decision —
// see docs/audience.md outlier list). These send 410 Gone, not 301, because
// there is no replacement.
const GONE_SLUGS = new Set([
  // Confirmed deletions per audience.md (Feb 2026)
  "popular-science-nobel-prize",
  "the-green-bond-commitment-premium",
  "defis-42-billion-maturity-story",
  "the-state-of-ai-report-2025",
  "nvidia-likes-small-language-models",
  "book-review-why-machines-learn",
  "damodaran-on-golds-2025-surge",
  "your-manager-is-not-the-problem",
  "state-of-mobile-2026",
  "bitcoin-security",
  // Likely deleted (no current canonical match)
  "notes-the-space-between",
  "zochi-ai-passes-academic-peer-review",
  "your-ai-assistant-might-rat-you-out",
  "google-discovers-new-cancer-therapy-pathway",
  "llm-helped-discover-a-new-cancer-therapy-pathway",
  "openai-cuts-prices-raises-stakes",
  "metas-edge-ai-gambit",
  "gratitude",
  "how-some-active-funds-create-their-own-returns",
  "2026-investment-strategy-preparing-my-portfolio-for-ai-dollar-risks-and-europes-growth",
]);

// Old taxonomy paths that don't exist on the current site
const TAXONOMY_RENAMES = {
  "/categories/commentary/": "/types/commentary/",
  "/categories/commentary": "/types/commentary/",
  "/categories/finance/": "/categories/investing/",
  "/categories/finance": "/categories/investing/",
};

// Substack-era date-prefix URL pattern: /YYYY/MM/DD/slug/
// Group 1 captures the slug (everything after the date).
const DATE_PREFIX_REGEX = /^\/(\d{4})\/(\d{2})\/(\d{2})\/([^?]+?)\/?$/;

// WordPress-style root pagination: /page/N/  → /posts/page/N/
const WP_PAGINATION_REGEX = /^\/page\/(\d+)\/?$/;

/**
 * Given a URL pathname, return the redirect to apply (or null if no redirect).
 *
 * @param {string} pathname  e.g. "/posts/old-slug/"
 * @returns {{ status: 301 | 410, location?: string } | null}
 */
export function resolveRedirect(pathname) {
  // 1. Taxonomy renames (exact-match paths)
  if (pathname in TAXONOMY_RENAMES) {
    return { status: 301, location: TAXONOMY_RENAMES[pathname] };
  }

  // 2. WordPress-style pagination → Hugo pagination
  const wpPaginationMatch = pathname.match(WP_PAGINATION_REGEX);
  if (wpPaginationMatch) {
    return { status: 301, location: `/posts/page/${wpPaginationMatch[1]}/` };
  }

  // 3. /posts/<slug>/ paths — check rename map and gone set
  if (pathname.startsWith("/posts/")) {
    // Strip leading /posts/ and trailing slash to get the slug part.
    let slug = pathname.slice("/posts/".length);
    if (slug.endsWith("/")) slug = slug.slice(0, -1);
    if (slug.length === 0) return null;

    if (slug in SLUG_RENAMES) {
      return { status: 301, location: `/posts/${SLUG_RENAMES[slug]}/` };
    }
    if (GONE_SLUGS.has(slug)) {
      return { status: 410 };
    }
    // Unknown /posts/ slug falls through to origin (will 404 if truly missing).
    return null;
  }

  // 4. Substack-era /YYYY/MM/DD/<slug>/ paths
  const datePrefixMatch = pathname.match(DATE_PREFIX_REGEX);
  if (datePrefixMatch) {
    const slug = datePrefixMatch[4];

    // Renamed first
    if (slug in SLUG_RENAMES) {
      return { status: 301, location: `/posts/${SLUG_RENAMES[slug]}/` };
    }
    // Then known-gone
    if (GONE_SLUGS.has(slug)) {
      return { status: 410 };
    }
    // Then existing post under same slug
    if (CURRENT_POST_SLUGS.has(slug)) {
      return { status: 301, location: `/posts/${slug}/` };
    }
    // No mapping found — treat as gone (the URL pattern itself is legacy)
    return { status: 410 };
  }

  return null;
}

/**
 * Build a Response object for a resolved redirect.
 * Used by the Worker fetch handler.
 */
export function buildRedirectResponse(redirect) {
  if (redirect.status === 301) {
    return new Response(null, {
      status: 301,
      headers: {
        Location: redirect.location,
        "Cache-Control": "public, max-age=86400",
      },
    });
  }
  if (redirect.status === 410) {
    return new Response("Gone", {
      status: 410,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }
  // Should not happen with current resolver, but be defensive.
  return null;
}

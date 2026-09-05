// cacheKeyFor returns a synthetic Request used only as a Cache API key.
// It appends a `_v=html|md` query param so HTML and Markdown variants of
// the same URL live under different cache entries. The key is never sent
// to origin.
export const cacheKeyFor = (request, wantsMd) => {
  const url = new URL(request.url);
  url.searchParams.set("_v", wantsMd ? "md" : "html");
  // Cloudflare evaluates these validators in Cache.match. Dropping them
  // turns a browser revalidation into a full 200 response on every hit.
  const headers = new Headers();
  for (const name of ["If-None-Match", "If-Modified-Since"]) {
    if (request.headers.has(name)) headers.set(name, request.headers.get(name));
  }
  return new Request(url.toString(), { method: "GET", headers });
};

export const canReadCache = (request) => {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  // Keep authenticated requests and conditional/range semantics that the
  // Cache API cannot completely implement on the origin path.
  if (["Authorization", "Cookie", "Range", "If-Range", "If-Match", "If-Unmodified-Since"]
    .some((name) => request.headers.has(name))) return false;
  return !/(?:^|,)\s*(?:no-cache|no-store|max-age\s*=\s*0)(?:\s*(?:,|$))/i
    .test(request.headers.get("Cache-Control") || "") &&
    !/no-cache/i.test(request.headers.get("Pragma") || "");
};

export const canWriteCache = (request, response) => {
  if (!canReadCache(request) || request.method !== "GET" || response.status !== 200) return false;
  if (response.headers.has("Set-Cookie")) return false;
  if (/(?:^|,)\s*(?:private|no-store|no-cache)(?:\s*(?:=|,|$))/i
    .test(response.headers.get("Cache-Control") || "")) return false;
  // The key varies on representation; content encoding is handled by the
  // platform. Other Vary fields would require their own cache-key dimension.
  return (response.headers.get("Vary") || "").split(",")
    .every((name) => ["", "accept", "accept-encoding"].includes(name.trim().toLowerCase()));
};

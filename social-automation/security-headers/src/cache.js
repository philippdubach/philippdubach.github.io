// cacheKeyFor returns a synthetic Request used only as a Cache API key.
// It appends a `_v=html|md` query param so HTML and Markdown variants of
// the same URL live under different cache entries. The key is never sent
// to origin.
export const cacheKeyFor = (request, wantsMd) => {
  const url = new URL(request.url);
  url.searchParams.set("_v", wantsMd ? "md" : "html");
  return new Request(url.toString(), { method: "GET" });
};

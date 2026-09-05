const parseAccept = (header) => {
  if (!header) return [];
  return header.split(",").map((part) => {
    const [type, ...params] = part.trim().split(";");
    let q = 1;
    for (const p of params) {
      const [k, v] = p.trim().split("=");
      if (k === "q") {
        const parsed = parseFloat(v);
        // Malformed q-values default to 1 (HTTP weight default). Without
        // this guard, NaN propagates through Math.max and breaks ordering.
        q = Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 1;
      }
    }
    return { type: type.trim().toLowerCase(), q };
  });
};

export const wantsMarkdown = (request) => {
  const accept = request.headers.get("Accept");
  if (!accept) return false;

  const entries = parseAccept(accept);
  let mdQ = -1;
  let htmlQ = -1;
  let textQ = -1;
  let wildcardQ = -1;
  for (const { type, q } of entries) {
    if (type === "text/markdown") mdQ = Math.max(mdQ, q);
    if (type === "text/html") htmlQ = Math.max(htmlQ, q);
    if (type === "text/*") textQ = Math.max(textQ, q);
    if (type === "*/*") wildcardQ = Math.max(wildcardQ, q);
  }

  // q=0 explicitly forbids a representation, even when it is the only
  // named type. Wildcards may prefer HTML, but never opt clients into Markdown.
  if (mdQ <= 0) return false;
  if (htmlQ < 0) htmlQ = textQ >= 0 ? textQ : wildcardQ;
  if (htmlQ < 0) return true;
  return mdQ >= htmlQ;
};

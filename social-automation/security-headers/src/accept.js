const parseAccept = (header) => {
  if (!header) return [];
  return header.split(",").map((part) => {
    const [type, ...params] = part.trim().split(";");
    let q = 1;
    for (const p of params) {
      const [k, v] = p.trim().split("=");
      if (k === "q") q = parseFloat(v);
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
  for (const { type, q } of entries) {
    if (type === "text/markdown") mdQ = Math.max(mdQ, q);
    if (type === "text/html") htmlQ = Math.max(htmlQ, q);
  }

  if (mdQ < 0) return false;
  if (htmlQ < 0) return true;
  return mdQ >= htmlQ;
};

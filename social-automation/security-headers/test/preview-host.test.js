import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPreviewHostRedirect } from "../src/index.js";

test("retired preview host permanently redirects to the matching canonical URL", () => {
  const response = buildPreviewHostRedirect(
    new URL("https://new.philippdubach.com/writing/example/?ref=old"),
  );

  assert.equal(response.status, 301);
  assert.equal(
    response.headers.get("Location"),
    "https://philippdubach.com/writing/example/?ref=old",
  );
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, follow");
  assert.match(response.headers.get("Strict-Transport-Security"), /includeSubDomains/);
  assert.equal(response.body, null);
});

test("production host does not enter the preview redirect path", () => {
  assert.equal(
    buildPreviewHostRedirect(new URL("https://philippdubach.com/writing/")),
    null,
  );
});

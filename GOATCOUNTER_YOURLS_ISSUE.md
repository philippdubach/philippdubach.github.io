# GoatCounter + YOURLS Tracking Issue Analysis

## Problem Summary

Visitors accessing `https://philippdubach.com` via shortened URLs from `https://pdub.click/2511308` (YOURLS) are not showing up in GoatCounter stats.

## Root Cause

**YOURLS performs direct HTTP 301/302 redirects** from the shortened URL to the destination. This means:

1. **No JavaScript execution on shortened URL**: When a user visits `pdub.click/2511308`, YOURLS immediately sends an HTTP redirect response. The browser follows this redirect without loading any HTML/JavaScript on the shortened URL.

2. **GoatCounter only runs on destination**: Your GoatCounter script is embedded in `philippdubach.com` pages (via `baseof.html`), so it only executes when users land on your main site.

3. **Referrer may be lost**: While browsers typically preserve the referrer during redirects, some privacy settings, browser extensions, or redirect configurations can strip the `Referer` header, making it appear as direct traffic rather than traffic from your shortened URLs.

## Current Implementation

Your GoatCounter is correctly configured in `layouts/_default/baseof.html`:
```html
<script data-goatcounter="https://philippdubach.goatcounter.com/count"
        async src="https://gc.zgo.at/count.js"></script>
```

This works fine for direct visits to `philippdubach.com`, but doesn't track the redirect event itself.

## Solutions

### Solution 1: Server-Side Tracking via GoatCounter API (Recommended)

Track the redirect server-side from YOURLS using GoatCounter's API. This ensures every redirect is tracked, regardless of browser settings.

**Implementation on YOURLS server:**

1. **Create a YOURLS plugin** that calls GoatCounter API when a redirect happens:

```php
<?php
// File: user/plugins/goatcounter-track.php

yourls_add_action('redirect_location', 'track_goatcounter_redirect');

function track_goatcounter_redirect($args) {
    $url = $args[0];
    $keyword = $args[1];
    
    // Get the full short URL
    $short_url = YOURLS_SITE . '/' . $keyword;
    
    // Get the destination URL
    $long_url = yourls_get_keyword_longurl($keyword);
    
    // Extract path from destination URL
    $parsed = parse_url($long_url);
    $path = isset($parsed['path']) ? $parsed['path'] : '/';
    if (isset($parsed['query'])) {
        $path .= '?' . $parsed['query'];
    }
    
    // Get user agent and IP
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    
    // Prepare GoatCounter API request
    $api_url = 'https://philippdubach.goatcounter.com/api/v0/count';
    $data = [
        'no_events' => true,
        'hits' => [[
            'path' => $path,
            'ref' => $short_url,  // Track the short URL as referrer
            'ua' => $user_agent,
            'ip' => $ip,
        ]]
    ];
    
    // Send async request (non-blocking)
    $ch = curl_init($api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 1); // Don't wait for response
    curl_exec($ch);
    curl_close($ch);
    
    return $args;
}
```

2. **Enable the plugin** in YOURLS admin panel.

**Note**: You may need to add authentication if your GoatCounter instance requires it. Check your GoatCounter settings for API authentication requirements.

### Solution 2: Intermediate Redirect Page with GoatCounter

Modify YOURLS to show an intermediate page that loads GoatCounter before redirecting.

**Implementation:**

1. **Modify YOURLS redirect behavior** to use an intermediate page instead of direct HTTP redirect.

2. **Create a tracking page** that:
   - Loads GoatCounter script
   - Tracks the redirect
   - Then redirects to the final destination

This requires modifying YOURLS core files or using a plugin that changes redirect behavior.

### Solution 3: Track Referrer on Destination Page

Enhance your GoatCounter implementation to better track referrers from redirects.

**Modify `layouts/_default/baseof.html`:**

```html
{{ if not hugo.IsServer }}
<script>
  // Enhanced GoatCounter with referrer tracking
  window.goatcounter = {
    path: function(p) {
      // If referrer is from pdub.click, add it to the path
      if (document.referrer && document.referrer.includes('pdub.click')) {
        return p + '?ref=' + encodeURIComponent(document.referrer);
      }
      return p;
    }
  };
</script>
<script data-goatcounter="https://philippdubach.goatcounter.com/count"
        async src="https://gc.zgo.at/count.js"></script>
{{ end }}
```

However, this may not work if the referrer is stripped during redirect.

### Solution 4: Use GoatCounter's `ref` Parameter

Pass the short URL as a query parameter and track it:

1. **Modify YOURLS redirect** to append `?ref=pdub.click/2511308` to the destination URL.

2. **Update GoatCounter script** to read and track this parameter:

```html
<script>
  window.goatcounter = {
    path: function(p) {
      const url = new URL(window.location.href);
      const ref = url.searchParams.get('ref');
      if (ref) {
        // Track with referrer information
        return p + '?ref=' + encodeURIComponent(ref);
      }
      return p;
    }
  };
</script>
<script data-goatcounter="https://philippdubach.goatcounter.com/count"
        async src="https://gc.zgo.at/count.js"></script>
```

## Recommended Approach

**Solution 1 (Server-Side API Tracking)** is the most reliable because:
- ✅ Works regardless of browser settings or extensions
- ✅ Tracks every redirect, not just successful page loads
- ✅ Can track the short URL as the referrer
- ✅ No dependency on client-side JavaScript

## Testing

After implementing a solution:

1. Visit a shortened URL: `https://pdub.click/2511308`
2. Check GoatCounter dashboard for the visit
3. Verify the referrer shows as `pdub.click/2511308` or similar
4. Test with different browsers and privacy settings

## Additional Notes

- GoatCounter should track referrers by default, but direct redirects may strip this information
- Some privacy-focused browsers/extensions may block referrer headers
- Server-side tracking (Solution 1) bypasses these limitations


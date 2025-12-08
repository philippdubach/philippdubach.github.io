<?php
/**
 * Plugin Name: GoatCounter Tracking for YOURLS
 * Plugin URI: https://philippdubach.com
 * Description: Tracks YOURLS redirects in GoatCounter analytics via API
 * Version: 1.0
 * Author: Philipp Dubach
 * 
 * This plugin tracks every YOURLS redirect in GoatCounter using server-side API calls.
 * This ensures tracking works even when referrer headers are stripped during redirects.
 */

// No direct call
if (!defined('YOURLS_ABSPATH')) die();

// Hook into the redirect action
yourls_add_action('redirect_location', 'goatcounter_track_redirect');

/**
 * Track redirect in GoatCounter via API
 * 
 * @param array $args Array containing [0] => destination URL, [1] => keyword
 * @return array Unmodified args
 */
function goatcounter_track_redirect($args) {
    $destination_url = $args[0];
    $keyword = $args[1];
    
    // Build the short URL
    $short_url = YOURLS_SITE . '/' . $keyword;
    
    // Parse destination URL to get path
    $parsed = parse_url($destination_url);
    $path = isset($parsed['path']) ? $parsed['path'] : '/';
    
    // Add query string if present
    if (isset($parsed['query'])) {
        $path .= '?' . $parsed['query'];
    }
    
    // Get user information
    $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
    $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
    
    // Get referrer (if any)
    $referrer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
    
    // Prepare GoatCounter API payload
    // See: https://www.goatcounter.com/help/api
    $api_url = 'https://philippdubach.goatcounter.com/api/v0/count';
    
    $payload = [
        'no_events' => true,  // Only track pageviews, not events
        'hits' => [[
            'path' => $path,
            'ref' => $short_url,  // Track the short URL as the referrer
            'ua' => $user_agent,
            'ip' => $ip,
            'title' => 'Redirect from ' . $short_url,  // Optional: descriptive title
        ]]
    ];
    
    // Send async request (non-blocking, don't wait for response)
    // This ensures redirect speed isn't affected
    $ch = curl_init($api_url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => false,  // Don't wait for response
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
        ],
        CURLOPT_TIMEOUT => 1,  // Very short timeout
        CURLOPT_CONNECTTIMEOUT => 1,
    ]);
    
    // Execute in background (fire and forget)
    curl_exec($ch);
    curl_close($ch);
    
    // Return unmodified args so redirect proceeds normally
    return $args;
}





-- D1 Database Schema for pdub.click URL Shortener
-- Stores click analytics for each redirect

-- Links metadata table (for extended info beyond KV)
CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_code TEXT UNIQUE NOT NULL,
    long_url TEXT NOT NULL,
    title TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    is_active INTEGER DEFAULT 1,
    -- Constraints for data integrity
    CHECK (length(short_code) >= 1 AND length(short_code) <= 50),
    CHECK (length(long_url) >= 1 AND length(long_url) <= 2000)
);

-- Click analytics table (stores every click individually)
CREATE TABLE IF NOT EXISTS clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_code TEXT NOT NULL,
    clicked_at TEXT DEFAULT (datetime('now')),
    referrer TEXT,
    user_agent TEXT,
    country TEXT,
    city TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    ip_hash TEXT,  -- Hashed for privacy, useful for unique visitor counting
    -- Constraints
    CHECK (length(country) <= 2),
    CHECK (length(city) <= 100)
);

-- Indexes for fast querying
-- Primary lookups
CREATE INDEX IF NOT EXISTS idx_clicks_short_code ON clicks(short_code);
CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code);

-- Time-based queries
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at);

-- Analytics queries
CREATE INDEX IF NOT EXISTS idx_clicks_country ON clicks(country);
CREATE INDEX IF NOT EXISTS idx_clicks_device_type ON clicks(device_type);
CREATE INDEX IF NOT EXISTS idx_clicks_browser ON clicks(browser);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_clicks_short_code_clicked_at ON clicks(short_code, clicked_at);
CREATE INDEX IF NOT EXISTS idx_clicks_short_code_country ON clicks(short_code, country);

-- Unique visitor counting
CREATE INDEX IF NOT EXISTS idx_clicks_ip_hash ON clicks(ip_hash);
CREATE INDEX IF NOT EXISTS idx_clicks_short_code_ip_hash ON clicks(short_code, ip_hash);

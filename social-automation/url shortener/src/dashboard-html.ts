// Embedded Dashboard HTML - Single file for zero latency
// Uses vanilla JS with reactive patterns (Svelte-inspired) for minimal bundle size

export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>pdub.click - URL Shortener</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #ffffff;
      --bg-secondary: #fafafa;
      --bg-hover: #f5f5f5;
      --border: #e5e5e5;
      --border-light: #f0f0f0;
      --text: #171717;
      --text-secondary: #525252;
      --text-muted: #a3a3a3;
      --accent: #171717;
      --accent-hover: #404040;
      --success: #16a34a;
      --danger: #dc2626;
      --radius: 6px;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
      font-size: 15px;
      -webkit-font-smoothing: antialiased;
    }
    
    .container { max-width: 900px; margin: 0 auto; padding: 48px 24px; }
    
    /* Header */
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 48px;
    }
    
    .logo {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      letter-spacing: -0.02em;
    }
    
    .logo span { color: var(--text-muted); }
    
    .header-actions { display: flex; gap: 12px; }
    
    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      background: var(--bg);
      color: var(--text);
    }
    
    .btn:hover { 
      background: var(--bg-hover);
      border-color: var(--text-muted);
    }
    
    .btn-primary {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
    }
    
    .btn-primary:hover { 
      background: var(--accent-hover);
      border-color: var(--accent-hover);
    }
    
    .btn-danger { 
      color: var(--danger);
      border-color: var(--danger);
      background: transparent;
    }
    .btn-danger:hover { 
      background: var(--danger);
      color: white;
    }
    
    .btn-sm { padding: 5px 10px; font-size: 13px; }
    
    .btn-ghost {
      border: none;
      padding: 6px 10px;
      color: var(--text-secondary);
    }
    .btn-ghost:hover { 
      background: var(--bg-hover);
      color: var(--text);
    }
    
    /* Cards */
    .card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
    }
    
    .card-title {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    
    .card-value {
      font-size: 28px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    
    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 48px;
    }
    
    /* Section */
    .section {
      margin-bottom: 48px;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    /* Forms */
    .form-group { margin-bottom: 20px; }
    
    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }
    
    .form-input {
      width: 100%;
      padding: 10px 12px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--text);
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.15s;
    }
    
    .form-input:focus {
      outline: none;
      border-color: var(--text);
    }
    
    .form-input::placeholder { color: var(--text-muted); }
    
    .form-hint {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
    }
    
    /* Table */
    .table-container {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: 12px 16px;
      text-align: left;
    }
    
    th {
      background: var(--bg-secondary);
      font-weight: 500;
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border);
    }
    
    td {
      border-bottom: 1px solid var(--border-light);
      font-size: 14px;
    }
    
    tr:last-child td { border-bottom: none; }
    
    tr:hover td { background: var(--bg-secondary); }
    
    .link-url {
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--text-secondary);
    }
    
    .short-link {
      color: var(--text);
      text-decoration: none;
      font-weight: 500;
    }
    
    .short-link:hover { text-decoration: underline; }
    
    .clicks-count {
      font-variant-numeric: tabular-nums;
      color: var(--text-secondary);
    }
    
    .actions-cell {
      display: flex;
      gap: 8px;
    }
    
    /* Modal */
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      align-items: center;
      justify-content: center;
      z-index: 100;
      backdrop-filter: blur(2px);
    }
    
    .modal-overlay.active { display: flex; }
    
    .modal {
      background: var(--bg);
      border-radius: 8px;
      padding: 28px;
      width: 100%;
      max-width: 440px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .modal-title { 
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    
    .modal-close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 20px;
      padding: 4px;
      line-height: 1;
    }
    
    .modal-close:hover { color: var(--text); }
    
    /* Login */
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-secondary);
    }
    
    .login-box {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 40px;
      width: 100%;
      max-width: 360px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    
    .login-title {
      font-size: 20px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 4px;
      letter-spacing: -0.02em;
    }
    
    .login-subtitle {
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 28px;
      font-size: 14px;
    }
    
    /* Alerts */
    .alert {
      padding: 12px 14px;
      border-radius: var(--radius);
      margin-bottom: 16px;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: var(--danger);
    }
    
    .alert-success {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: var(--success);
    }
    
    .alert-close {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      opacity: 0.6;
    }
    
    .alert-close:hover { opacity: 1; }
    
    /* Charts */
    .chart-container {
      height: 140px;
      display: flex;
      align-items: flex-end;
      gap: 3px;
      padding: 16px 0;
    }
    
    .chart-bar {
      flex: 1;
      background: var(--text);
      border-radius: 2px 2px 0 0;
      min-height: 2px;
      transition: all 0.2s;
      position: relative;
      opacity: 0.7;
    }
    
    .chart-bar:hover { opacity: 1; }
    
    .chart-bar::after {
      content: attr(data-value);
      position: absolute;
      bottom: calc(100% + 4px);
      left: 50%;
      transform: translateX(-50%);
      font-size: 10px;
      color: var(--text-secondary);
      opacity: 0;
      transition: opacity 0.15s;
      font-weight: 500;
    }
    
    .chart-bar:hover::after { opacity: 1; }
    
    /* Copy button */
    .copy-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 2px;
      font-size: 14px;
    }
    
    .copy-btn:hover { color: var(--text); }
    
    /* Loading */
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      color: var(--text-muted);
      font-size: 14px;
    }
    
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid var(--border);
      border-top-color: var(--text);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin-right: 10px;
    }
    
    @keyframes spin { to { transform: rotate(360deg); } }
    
    /* Responsive */
    @media (max-width: 768px) {
      .container { padding: 24px 16px; }
      .stats-grid { grid-template-columns: 1fr; gap: 12px; }
      th, td { padding: 10px 12px; }
      .hide-mobile { display: none; }
      header { margin-bottom: 32px; }
    }
    
    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted);
    }
    
    .empty-state h3 { 
      color: var(--text);
      margin-bottom: 6px;
      font-weight: 500;
    }
    
    /* Stats detail */
    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid var(--border-light);
      font-size: 14px;
    }
    
    .stat-row:last-child { border-bottom: none; }
    
    .stat-label { color: var(--text-secondary); }
    .stat-value { font-weight: 500; font-variant-numeric: tabular-nums; }
  </style>
</head>
<body>
  <div id="app"></div>
  
  <script>
    // State management
    const state = {
      authenticated: false,
      loading: true,
      links: [],
      stats: null,
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      selectedLink: null,
      linkStats: null,
      error: null,
      success: null,
      activeTab: 'links'
    };
    
    // API helper
    async function api(endpoint, options = {}) {
      const res = await fetch('/api' + endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    }
    
    // Check auth status
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        state.authenticated = data.authenticated;
      } catch {
        state.authenticated = false;
      }
      state.loading = false;
      render();
    }
    
    // Login
    async function login(password) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        const data = await res.json();
        if (data.success) {
          state.authenticated = true;
          state.error = null;
          loadDashboard();
        } else {
          state.error = 'Invalid password';
        }
      } catch (e) {
        state.error = e.message;
      }
      render();
    }
    
    // Logout
    async function logout() {
      await fetch('/api/auth/logout', { method: 'POST' });
      state.authenticated = false;
      state.links = [];
      state.stats = null;
      render();
    }
    
    // Load dashboard data
    async function loadDashboard() {
      try {
        const [linksRes, statsRes] = await Promise.all([
          api('/links?page=' + state.pagination.page + '&limit=' + state.pagination.limit),
          api('/stats')
        ]);
        state.links = linksRes.data.links;
        state.pagination = linksRes.data.pagination;
        state.stats = statsRes.data;
      } catch (e) {
        state.error = e.message;
      }
      render();
    }
    
    // Create link
    async function createLink(url, customCode, title) {
      try {
        const res = await api('/links', {
          method: 'POST',
          body: JSON.stringify({ url, customCode: customCode || undefined, title: title || undefined })
        });
        state.success = 'Link created: pdub.click/' + res.data.shortCode;
        closeModal();
        loadDashboard();
      } catch (e) {
        state.error = e.message;
      }
      render();
    }
    
    // Delete link
    async function deleteLink(code) {
      if (!confirm('Delete this link?')) return;
      try {
        await api('/links/' + code, { method: 'DELETE' });
        state.success = 'Link deleted';
        loadDashboard();
      } catch (e) {
        state.error = e.message;
      }
      render();
    }
    
    // Load link stats
    async function loadLinkStats(code) {
      try {
        const res = await api('/links/' + code + '/stats');
        state.linkStats = res.data;
        state.selectedLink = code;
      } catch (e) {
        state.error = e.message;
      }
      render();
    }
    
    // Copy to clipboard
    async function copyToClipboard(text) {
      await navigator.clipboard.writeText(text);
      state.success = 'Copied to clipboard!';
      render();
      setTimeout(() => { state.success = null; render(); }, 2000);
    }
    
    // Modal helpers
    function openModal(id) {
      document.getElementById(id)?.classList.add('active');
    }
    
    function closeModal() {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      state.selectedLink = null;
      state.linkStats = null;
    }
    
    // Render functions
    function renderLogin() {
      return \`
        <div class="login-container">
          <div class="login-box">
            <h1 class="login-title">pdub.click</h1>
            <p class="login-subtitle">URL Shortener</p>
            \${state.error ? '<div class="alert alert-error">' + state.error + '<button class="alert-close" onclick="state.error=null;render()">×</button></div>' : ''}
            <form onsubmit="event.preventDefault(); login(this.password.value);">
              <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" name="password" class="form-input" placeholder="Enter password" required autofocus>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%">Sign in</button>
            </form>
          </div>
        </div>
      \`;
    }
    
    function renderChart(data, maxBars = 30) {
      if (!data || data.length === 0) return '<div class="chart-container"><p style="margin:auto;color:var(--text-muted)">No data yet</p></div>';
      const slice = data.slice(-maxBars);
      const max = Math.max(...slice.map(d => d.count), 1);
      return \`
        <div class="chart-container">
          \${slice.map(d => \`
            <div class="chart-bar" style="height:\${(d.count / max) * 100}%" data-value="\${d.count}"></div>
          \`).join('')}
        </div>
      \`;
    }
    
    function renderDashboard() {
      const s = state.stats || {};
      return \`
        <div class="container">
          <header>
            <div class="logo">pdub<span>.click</span></div>
            <div class="header-actions">
              <button class="btn btn-primary" onclick="openModal('create-modal')">New Link</button>
              <button class="btn btn-ghost" onclick="logout()">Sign out</button>
            </div>
          </header>
          
          \${state.error ? '<div class="alert alert-error">' + state.error + '<button class="alert-close" onclick="state.error=null;render()">×</button></div>' : ''}
          \${state.success ? '<div class="alert alert-success">' + state.success + '<button class="alert-close" onclick="state.success=null;render()">×</button></div>' : ''}
          
          <div class="stats-grid">
            <div class="card">
              <div class="card-title">Links</div>
              <div class="card-value">\${s.totalLinks || 0}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Clicks</div>
              <div class="card-value">\${s.totalClicks || 0}</div>
            </div>
            <div class="card">
              <div class="card-title">Today</div>
              <div class="card-value">\${s.clicksToday || 0}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="card" style="padding:16px 20px">
              <div class="card-title" style="margin-bottom:0">Last 30 Days</div>
              \${renderChart(s.clicksOverTime)}
            </div>
          </div>
          
          <div class="section">
            <div class="section-header">
              <span class="section-title">Links</span>
            </div>
            
            \${state.links.length === 0 ? \`
              <div class="empty-state">
                <h3>No links yet</h3>
                <p>Create your first short link to get started</p>
              </div>
            \` : \`
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Short URL</th>
                      <th>Destination</th>
                      <th class="hide-mobile">Title</th>
                      <th>Clicks</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    \${state.links.map(link => \`
                      <tr>
                        <td>
                          <a href="https://pdub.click/\${link.shortCode}" target="_blank" class="short-link">/\${link.shortCode}</a>
                          <button class="copy-btn" onclick="copyToClipboard('https://pdub.click/\${link.shortCode}')" title="Copy">⎘</button>
                        </td>
                        <td class="link-url" title="\${link.longUrl}">\${link.longUrl}</td>
                        <td class="hide-mobile" style="color:var(--text-secondary)">\${link.title || '—'}</td>
                        <td class="clicks-count">\${link.totalClicks}</td>
                        <td>
                          <div class="actions-cell">
                            <button class="btn btn-sm" onclick="loadLinkStats('\${link.shortCode}');openModal('stats-modal')">Stats</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteLink('\${link.shortCode}')">Delete</button>
                          </div>
                        </td>
                      </tr>
                    \`).join('')}
                  </tbody>
                </table>
              </div>
              
              \${state.pagination.totalPages > 1 ? \`
                <div style="display:flex;justify-content:center;gap:8px;margin-top:20px;font-size:14px">
                  <button class="btn btn-sm" \${state.pagination.page <= 1 ? 'disabled' : ''} 
                    onclick="state.pagination.page--;loadDashboard()">← Previous</button>
                  <span style="padding:6px 12px;color:var(--text-secondary)">\${state.pagination.page} / \${state.pagination.totalPages}</span>
                  <button class="btn btn-sm" \${state.pagination.page >= state.pagination.totalPages ? 'disabled' : ''} 
                    onclick="state.pagination.page++;loadDashboard()">Next →</button>
                </div>
              \` : ''}
            \`}
          </div>
          
          <!-- Create Link Modal -->
          <div id="create-modal" class="modal-overlay" onclick="if(event.target===this)closeModal()">
            <div class="modal">
              <div class="modal-header">
                <h3 class="modal-title">New Link</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
              </div>
              <form onsubmit="event.preventDefault(); createLink(this.url.value, this.code.value, this.title.value);">
                <div class="form-group">
                  <label class="form-label">Destination URL</label>
                  <input type="url" name="url" class="form-input" placeholder="https://example.com/page" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Custom slug (optional)</label>
                  <input type="text" name="code" class="form-input" placeholder="my-link" pattern="[a-zA-Z0-9_-]{1,50}">
                  <p class="form-hint">Leave empty for auto-generated</p>
                </div>
                <div class="form-group">
                  <label class="form-label">Title (optional)</label>
                  <input type="text" name="title" class="form-input" placeholder="Campaign name">
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%">Create</button>
              </form>
            </div>
          </div>
          
          <!-- Stats Modal -->
          <div id="stats-modal" class="modal-overlay" onclick="if(event.target===this)closeModal()">
            <div class="modal" style="max-width:560px">
              <div class="modal-header">
                <h3 class="modal-title">Statistics</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
              </div>
              \${state.linkStats ? \`
                <div style="margin-bottom:24px">
                  <p style="color:var(--text-muted);font-size:12px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Short URL</p>
                  <p style="font-size:16px;font-weight:500">pdub.click/\${state.linkStats.shortCode}</p>
                </div>
                <div style="margin-bottom:24px">
                  <p style="color:var(--text-muted);font-size:12px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Destination</p>
                  <p style="font-size:14px;word-break:break-all;color:var(--text-secondary)">\${state.linkStats.longUrl}</p>
                </div>
                <div class="stats-grid" style="grid-template-columns:1fr 1fr;margin-bottom:24px">
                  <div class="card">
                    <div class="card-title">Clicks</div>
                    <div class="card-value">\${state.linkStats.totalClicks}</div>
                  </div>
                  <div class="card">
                    <div class="card-title">Unique</div>
                    <div class="card-value">\${state.linkStats.uniqueVisitors}</div>
                  </div>
                </div>
                <div class="card" style="margin-bottom:16px;padding:16px 20px">
                  <div class="card-title" style="margin-bottom:0">Clicks Over Time</div>
                  \${renderChart(state.linkStats.clicksOverTime)}
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                  <div class="card">
                    <div class="card-title">Countries</div>
                    \${Object.entries(state.linkStats.clicksByCountry || {}).slice(0,5).map(([k,v]) => 
                      '<div class="stat-row"><span class="stat-label">' + k + '</span><span class="stat-value">' + v + '</span></div>'
                    ).join('') || '<p style="color:var(--text-muted);font-size:14px">No data</p>'}
                  </div>
                  <div class="card">
                    <div class="card-title">Devices</div>
                    \${Object.entries(state.linkStats.clicksByDevice || {}).map(([k,v]) => 
                      '<div class="stat-row"><span class="stat-label">' + k + '</span><span class="stat-value">' + v + '</span></div>'
                    ).join('') || '<p style="color:var(--text-muted);font-size:14px">No data</p>'}
                  </div>
                </div>
              \` : '<div class="loading"><div class="spinner"></div>Loading...</div>'}
            </div>
          </div>
        </div>
      \`;
    }
    
    function render() {
      const app = document.getElementById('app');
      if (state.loading) {
        app.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';
      } else if (!state.authenticated) {
        app.innerHTML = renderLogin();
      } else {
        app.innerHTML = renderDashboard();
      }
    }
    
    // Initialize
    checkAuth().then(() => {
      if (state.authenticated) loadDashboard();
    });
  </script>
</body>
</html>`;
}

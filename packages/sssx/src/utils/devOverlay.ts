/**
 * HTML error overlay for the dev server.
 * Displayed in the browser when a build fails.
 */
export const errorOverlay = (error: unknown, route?: string): string => {
  const err = error instanceof Error ? error : new Error(String(error));
  const message = escapeHtml(err.message);
  const stack = err.stack ? escapeHtml(err.stack) : "";

  // Extract file/line from stack
  const fileMatch = stack.match(/at\s+.*?\((.+?:\d+:\d+)\)/) ||
    stack.match(/at\s+(.+?:\d+:\d+)/);
  const fileLoc = fileMatch ? fileMatch[1] : "";

  // Hint
  const hint = getHint(err.message);

  return `<!doctype html>
<html>
<head>
  <title>SSSX Build Error</title>
  <style>
    * { box-sizing: border-box; margin: 0; }
    body {
      font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace;
      background: #1a1a2e;
      color: #eee;
      padding: 2rem;
      min-height: 100vh;
    }
    .overlay {
      max-width: 56rem;
      margin: 0 auto;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .header .icon { font-size: 2rem; }
    .header h1 {
      font-size: 1.25rem;
      color: #ff6b6b;
      font-weight: 600;
    }
    .route {
      background: #16213e;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      color: #7f8fa6;
      font-size: 0.85rem;
    }
    .route span { color: #ffd93d; }
    .message {
      background: #0f3460;
      border-left: 4px solid #ff6b6b;
      padding: 1.25rem;
      border-radius: 0 8px 8px 0;
      margin-bottom: 1rem;
      font-size: 1rem;
      line-height: 1.6;
      color: #ff6b6b;
      word-break: break-word;
    }
    .file {
      background: #16213e;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      color: #48dbfb;
      font-size: 0.85rem;
    }
    .hint {
      background: #1b2838;
      border-left: 4px solid #ffd93d;
      padding: 1rem 1.25rem;
      border-radius: 0 8px 8px 0;
      margin-bottom: 1rem;
      color: #ffd93d;
      font-size: 0.9rem;
    }
    .hint::before { content: "💡 "; }
    .stack {
      background: #0a0a1a;
      padding: 1rem;
      border-radius: 8px;
      font-size: 0.75rem;
      line-height: 1.8;
      color: #7f8fa6;
      overflow-x: auto;
      white-space: pre-wrap;
    }
    details summary {
      cursor: pointer;
      color: #7f8fa6;
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
    }
    .footer {
      margin-top: 2rem;
      color: #4a4a6a;
      font-size: 0.75rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="overlay">
    <div class="header">
      <span class="icon">🔴</span>
      <h1>Build Error</h1>
    </div>
    ${route ? `<div class="route">Route: <span>${escapeHtml(route)}</span></div>` : ""}
    <div class="message">${message}</div>
    ${fileLoc ? `<div class="file">📄 ${escapeHtml(fileLoc)}</div>` : ""}
    ${hint ? `<div class="hint">${escapeHtml(hint)}</div>` : ""}
    <details>
      <summary>Stack trace</summary>
      <div class="stack">${stack}</div>
    </details>
    <div class="footer">SSSX dev server — save a file to retry</div>
  </div>
</body>
</html>`;
};

/**
 * Dev 404 page showing available routes
 */
export const dev404Page = (
  url: string,
  routes: Array<{ permalink: string; type: string }>
): string => {
  const sorted = [...routes].sort((a, b) => a.permalink.localeCompare(b.permalink));
  const routeList = sorted
    .map(
      (r) =>
        `<a href="${r.permalink}" class="route-link"><span class="path">${escapeHtml(r.permalink)}</span><span class="badge ${r.type}">${r.type}</span></a>`
    )
    .join("\n      ");

  return `<!doctype html>
<html>
<head>
  <title>404 — SSSX Dev</title>
  <style>
    * { box-sizing: border-box; margin: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #fafafa;
      color: #333;
      padding: 2rem;
    }
    .container { max-width: 40rem; margin: 2rem auto; }
    h1 { color: #ef4444; font-size: 1.5rem; margin-bottom: 0.5rem; }
    .url { color: #6b7280; margin-bottom: 2rem; font-family: monospace; background: #f3f4f6; padding: 0.5rem 1rem; border-radius: 6px; }
    h2 { font-size: 1rem; color: #6b7280; margin-bottom: 0.75rem; }
    .route-link {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.6rem 0.75rem;
      text-decoration: none;
      color: #1a1a1a;
      border-bottom: 1px solid #f3f4f6;
      border-radius: 4px;
      transition: background 0.1s;
    }
    .route-link:hover { background: #eff6ff; }
    .path { font-family: monospace; font-size: 0.9rem; }
    .badge {
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
    }
    .badge.plain { background: #dbeafe; color: #1d4ed8; }
    .badge.filesystem { background: #dcfce7; color: #15803d; }
    .badge.content { background: #fef3c7; color: #92400e; }
    .search {
      width: 100%;
      padding: 0.6rem 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      outline: none;
    }
    .search:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px #bfdbfe; }
    .count { color: #9ca3af; font-size: 0.8rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>404 — Route not found</h1>
    <div class="url">${escapeHtml(url)}</div>
    <h2>Available routes (${routes.length})</h2>
    <input type="text" class="search" placeholder="Filter routes..." oninput="filter(this.value)" autofocus />
    <div class="count" id="count">${routes.length} routes</div>
    <div id="routes">
      ${routeList}
    </div>
  </div>
  <script>
    function filter(q) {
      const links = document.querySelectorAll('.route-link');
      let shown = 0;
      links.forEach(el => {
        const match = el.querySelector('.path').textContent.includes(q);
        el.style.display = match ? '' : 'none';
        if (match) shown++;
      });
      document.getElementById('count').textContent = shown + ' routes';
    }
  </script>
</body>
</html>`;
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getHint(message: string): string | undefined {
  if (message.includes("Cannot find module") || message.includes("MODULE_NOT_FOUND"))
    return "Run npm install to install dependencies.";
  if (message.includes("+layout.svelte"))
    return "Every SSSX project needs a src/+layout.svelte file.";
  if (message.includes("+page.svelte"))
    return "Each route needs a +page.svelte file.";
  if (message.includes("ENOENT"))
    return "A referenced file doesn't exist. Check paths in templates and content.";
  if (message.includes("SyntaxError"))
    return "Check your Svelte/TypeScript syntax.";
  if (message.includes("svelte/internal"))
    return "Svelte resolution failed. Make sure svelte is installed: npm install svelte";
  return undefined;
}

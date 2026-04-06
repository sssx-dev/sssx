import fs from "node:fs";
import path from "node:path";
import { type Config } from "../config.ts";
import { type RouteInfo } from "../routes/types.ts";

/**
 * Search index generator for static sites.
 *
 * Generates a JSON search index at build time that can be loaded
 * by a lightweight client-side search library.
 *
 * For million-page sites, the index is split into chunks by first
 * URL segment to keep individual file sizes manageable.
 */

export interface SearchEntry {
  /** Page URL */
  url: string;
  /** Page title */
  title: string;
  /** Description or excerpt */
  description: string;
  /** Keywords/tags */
  keywords: string;
  /** Content type */
  type: string;
  /** Locale */
  locale: string;
  /** Content body text (truncated) */
  body: string;
}

export interface SearchIndex {
  entries: SearchEntry[];
  totalPages: number;
  generatedAt: string;
}

const MAX_BODY_LENGTH = 300;
const CHUNK_SIZE = 5000;

/** Strip HTML tags from content */
const stripHtml = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/** Extract text content from rendered HTML file */
const extractBodyText = (htmlPath: string): string => {
  if (!fs.existsSync(htmlPath)) return "";
  try {
    const html = fs.readFileSync(htmlPath, "utf8");
    // Extract content from #app div
    const appMatch = html.match(/<div id="app">([\s\S]*?)<\/div>\s*(?:<script)/);
    if (appMatch) {
      return stripHtml(appMatch[1]).slice(0, MAX_BODY_LENGTH);
    }
    return "";
  } catch {
    return "";
  }
};

/**
 * Build the search index from all routes.
 */
export const buildSearchIndex = (
  outdir: string,
  config: Config,
  routes: RouteInfo[]
): void => {
  const searchDir = path.join(outdir, "_search");
  if (!fs.existsSync(searchDir)) {
    fs.mkdirSync(searchDir, { recursive: true });
  }

  const entries: SearchEntry[] = [];

  for (const route of routes) {
    // Skip draft pages
    if (route.param?.draft) continue;
    // Skip pages scheduled for the future
    if (route.param?.date) {
      const pubDate = new Date(route.param.date);
      if (pubDate > new Date()) continue;
    }

    const htmlPath = path.join(outdir, route.permalink, "index.html");
    const body = extractBodyText(htmlPath);

    const p = route.param || {};
    entries.push({
      url: route.permalink,
      title: p.title || "",
      description: p.description || "",
      keywords: Array.isArray(p.tags) ? p.tags.join(", ") : (p.tags || p.keywords || ""),
      type: route.type,
      locale: route.locale || config.defaultLocale || "en-US",
      body,
    });
  }

  // Write full index (for small sites)
  const fullIndex: SearchIndex = {
    entries,
    totalPages: entries.length,
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(searchDir, "index.json"),
    JSON.stringify(fullIndex),
    "utf8"
  );

  // For large sites, also write chunked indexes
  if (entries.length > CHUNK_SIZE) {
    const chunks: Record<string, SearchEntry[]> = {};

    for (const entry of entries) {
      const segment = entry.url.split("/").filter(Boolean)[0] || "_root";
      if (!chunks[segment]) chunks[segment] = [];
      chunks[segment].push(entry);
    }

    const manifest: Record<string, { file: string; count: number }> = {};

    for (const [segment, chunk] of Object.entries(chunks)) {
      const filename = `chunk-${segment}.json`;
      fs.writeFileSync(
        path.join(searchDir, filename),
        JSON.stringify({ entries: chunk }),
        "utf8"
      );
      manifest[segment] = { file: filename, count: chunk.length };
    }

    fs.writeFileSync(
      path.join(searchDir, "manifest.json"),
      JSON.stringify({ chunks: manifest, totalPages: entries.length }),
      "utf8"
    );
  }
};

/**
 * Generate the client-side search script.
 * Lightweight ~2KB search that loads the index on demand.
 */
export const generateSearchWidget = (): string => {
  return `<!-- SSSX Search Widget -->
<div id="sssx-search" style="display:none">
  <div class="sssx-search-backdrop" onclick="sssxSearch.close()"></div>
  <div class="sssx-search-modal">
    <input type="text" id="sssx-search-input" placeholder="Search..." autocomplete="off" />
    <div id="sssx-search-results"></div>
    <div class="sssx-search-footer">
      <span>↑↓ Navigate</span>
      <span>↵ Open</span>
      <span>Esc Close</span>
    </div>
  </div>
</div>
<style>
  #sssx-search { position:fixed; inset:0; z-index:9999; display:flex; align-items:flex-start; justify-content:center; padding-top:15vh; }
  .sssx-search-backdrop { position:absolute; inset:0; background:rgba(0,0,0,0.5); }
  .sssx-search-modal { position:relative; background:#fff; border-radius:12px; width:90%; max-width:560px; box-shadow:0 25px 50px rgba(0,0,0,0.25); overflow:hidden; font-family:system-ui,sans-serif; }
  #sssx-search-input { width:100%; padding:16px 20px; border:none; font-size:16px; outline:none; border-bottom:1px solid #e5e7eb; box-sizing:border-box; }
  #sssx-search-results { max-height:50vh; overflow-y:auto; }
  .sssx-sr { padding:12px 20px; cursor:pointer; border-bottom:1px solid #f3f4f6; }
  .sssx-sr:hover,.sssx-sr.active { background:#eff6ff; }
  .sssx-sr-title { font-weight:600; font-size:14px; color:#1a1a1a; }
  .sssx-sr-url { font-size:12px; color:#6b7280; margin-top:2px; }
  .sssx-sr-desc { font-size:13px; color:#4b5563; margin-top:4px; }
  .sssx-sr mark { background:#fef08a; padding:0 2px; border-radius:2px; }
  .sssx-search-footer { padding:8px 20px; background:#f9fafb; display:flex; gap:16px; font-size:12px; color:#9ca3af; }
  .sssx-search-empty { padding:40px 20px; text-align:center; color:#9ca3af; }
</style>
<script>
(function(){
  var idx=null,active=-1,results=[];
  var sssxSearch=window.sssxSearch={
    open:function(){
      if(!idx)fetch('/_search/index.json').then(r=>r.json()).then(d=>{idx=d.entries;});
      document.getElementById('sssx-search').style.display='flex';
      var inp=document.getElementById('sssx-search-input');inp.value='';inp.focus();
      document.getElementById('sssx-search-results').innerHTML='<div class="sssx-search-empty">Type to search '+((idx&&idx.length)||'...')+' pages</div>';
    },
    close:function(){document.getElementById('sssx-search').style.display='none';active=-1;},
    search:function(q){
      if(!idx||!q){document.getElementById('sssx-search-results').innerHTML='<div class="sssx-search-empty">Type to search</div>';return;}
      var ql=q.toLowerCase();
      results=idx.filter(function(e){
        return (e.title+' '+e.description+' '+e.keywords+' '+e.body+' '+e.url).toLowerCase().indexOf(ql)>=0;
      }).slice(0,20);
      active=-1;
      var box=document.getElementById('sssx-search-results');
      if(!results.length){box.innerHTML='<div class="sssx-search-empty">No results for "'+q+'"</div>';return;}
      box.innerHTML=results.map(function(r,i){
        var t=highlight(r.title||r.url,ql),d=highlight((r.description||r.body||'').slice(0,120),ql);
        return '<div class="sssx-sr" data-i="'+i+'" onclick="location.href=\\''+r.url+'\\'"><div class="sssx-sr-title">'+t+'</div><div class="sssx-sr-url">'+r.url+'</div>'+(d?'<div class="sssx-sr-desc">'+d+'</div>':'')+'</div>';
      }).join('');
    }
  };
  function highlight(t,q){if(!t)return'';var i=t.toLowerCase().indexOf(q);if(i<0)return esc(t);return esc(t.slice(0,i))+'<mark>'+esc(t.slice(i,i+q.length))+'</mark>'+esc(t.slice(i+q.length));}
  function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  document.addEventListener('keydown',function(e){
    if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();sssxSearch.open();}
    if(e.key==='Escape')sssxSearch.close();
    if(document.getElementById('sssx-search').style.display==='flex'){
      if(e.key==='ArrowDown'){e.preventDefault();active=Math.min(active+1,results.length-1);updateActive();}
      if(e.key==='ArrowUp'){e.preventDefault();active=Math.max(active-1,0);updateActive();}
      if(e.key==='Enter'&&active>=0&&results[active]){location.href=results[active].url;}
    }
  });
  document.addEventListener('DOMContentLoaded',function(){
    var inp=document.getElementById('sssx-search-input');
    if(inp)inp.addEventListener('input',function(){sssxSearch.search(this.value);});
  });
  function updateActive(){var els=document.querySelectorAll('.sssx-sr');els.forEach(function(el,i){el.classList.toggle('active',i===active);});if(els[active])els[active].scrollIntoView({block:'nearest'});}
})();
</script>`;
};

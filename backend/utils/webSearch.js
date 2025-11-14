import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

/**
 * Minimal web search using SerpAPI (https://serpapi.com).
 * Set SERPAPI_KEY in your backend .env to enable. Returns an array of snippet strings.
 */
export async function webSearch(query, maxResults = 3) {
  const key = process.env.SERPAPI_KEY;
  if (!key) {
    console.warn('SerpAPI key not configured (SERPAPI_KEY). Skipping web search.');
    return [];
  }

  const params = new URLSearchParams({
    q: query,
    api_key: key,
    engine: 'google',
    num: String(maxResults)
  });

  const url = `https://serpapi.com/search.json?${params.toString()}`;

  try {
    const res = await fetch(url, { timeout: 10000 });
    if (!res.ok) throw new Error(`Search API responded ${res.status}`);
    const data = await res.json();

    // Collect top organic results' snippets
    const snippets = [];
    if (Array.isArray(data.organic_results)) {
      for (const r of data.organic_results.slice(0, maxResults)) {
        if (r.snippet) snippets.push(`${r.title || ''}: ${r.snippet}`);
        else if (r.title) snippets.push(r.title);
      }
    }

    // Fallback: use 'answer_box' or 'news' if present
    if (snippets.length === 0 && data.answer_box) {
      if (data.answer_box.answer) snippets.push(String(data.answer_box.answer));
      else if (data.answer_box.snippet) snippets.push(String(data.answer_box.snippet));
    }

    return snippets;
  } catch (err) {
    console.error('Web search error:', err && err.message ? err.message : err);
    return [];
  }
}

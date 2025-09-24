export async function fetchMessage() {
  try {
    // Prefer an explicit API base (for preview/prod); fall back to relative path for Vite dev proxy
    const base = import.meta?.env?.VITE_API_URL
      ? String(import.meta.env.VITE_API_URL).trim().replace(/\/$/, '')
      : '';
    const url = `${base}/api/hello`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data; // { message: string }
  } catch (err) {
    console.error('Failed to fetch backend message:', err);
    return { message: 'Failed to fetch from backend' };
  }
}

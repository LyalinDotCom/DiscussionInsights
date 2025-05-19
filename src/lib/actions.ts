"use server";

export async function fetchUrlContent(url: string): Promise<{ content?: string; error?: string; finalUrl?: string }> {
  try {
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) {
      return { error: `Failed to fetch URL: ${response.status} ${response.statusText}` };
    }
    const textContent = await response.text();
    // Return the final URL after redirects, if any
    const finalUrl = response.url; 
    return { content: textContent, finalUrl };
  } catch (e: any) {
    console.error("Error fetching URL content:", e);
    if (e.cause && typeof e.cause === 'object' && 'code' in e.cause) {
        // Handle specific Node.js fetch errors like ENOTFOUND, ECONNREFUSED
        const nodeError = e.cause as { code: string };
        if (nodeError.code === 'ENOTFOUND') {
            return { error: `Could not resolve hostname for URL: ${url}. Please check the URL.`};
        }
        if (nodeError.code === 'ECONNREFUSED') {
            return { error: `Connection refused for URL: ${url}. The server might be down or blocking requests.`};
        }
    }
    return { error: `Error fetching URL. Please ensure it's correct and accessible: ${e.message}` };
  }
}

export default {
  async fetch(request) {
    // GitHub README 原始網址
    const githubRawURL = "https://raw.githubusercontent.com/Littlemeow0122/HTML-Work/main/README.md";

    // 直接 fetch，關閉快取
    const res = await fetch(githubRawURL, {
      headers: { "Cache-Control": "no-cache" }
    });

    const md = await res.text();

    return new Response(md, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*", // 讓 HTML 可抓
        "Cache-Control": "no-store"
      }
    });
  }
};

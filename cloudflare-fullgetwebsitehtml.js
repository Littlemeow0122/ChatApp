export default {
  async fetch(request) {
    const url = new URL(request.url);

    // === 代理抓 HTML ===
    if (url.pathname.startsWith('/fetch:')) {
      const target = decodeURIComponent(url.pathname.slice(7));

      try {
        const res = await fetch(target, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();

        return new Response(html, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (e) {
        return new Response(e.message, { status: 500 });
      }
    }

    // === 自動下載 UI（空白頁面）===
    return new Response(HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
};

const HTML = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>about:blank</title>
<style>
  body { background: #fff; margin:0; padding:0; }
</style>
</head>
<body>
<script>
(async () => {
  // 解析 /url:xxx
  const path = location.pathname;
  if (!path.startsWith('/url:')) return;

  const targetURL = decodeURIComponent(path.slice(5));

  try {
    // 透過 Worker 代理抓 HTML
    const res = await fetch('/fetch:' + encodeURIComponent(targetURL));
    if (!res.ok) throw new Error(res.status);

    const html = await res.text();
    const title = (new DOMParser().parseFromString(html,'text/html').title || 'page') + '.html';

    // 生成 Blob 並觸發下載
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);

    // 可選：自動關閉頁面（部分瀏覽器可能被阻止）
    // window.close();

  } catch(e) {
    document.body.innerHTML = '<p style="color:red;font-family:sans-serif;">下載失敗：'+e.message+'</p>';
  }
})();
</script>
</body>
</html>`;

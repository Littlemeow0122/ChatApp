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

    // === 回傳完整 HTML UI ===
    return new Response(HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
};

const HTML = `<!doctype html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>網頁HTML提取器</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
body, * { box-sizing: border-box; }
</style>
</head>
<body class="h-full">
<div id="app" class="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 overflow-auto">
<div class="min-h-full w-full flex flex-col items-center justify-start p-6">
<div class="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">

<h1 class="text-4xl font-bold text-center mb-2 text-gray-800">網頁HTML提取器</h1>
<p class="text-center text-gray-600 mb-8">輸入網址來提取網頁的HTML代碼</p>

<div class="mb-6">
<label class="block text-lg font-semibold text-gray-700 mb-2">網頁URL</label>
<div class="flex gap-3">
<input id="url-input" class="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg">
<button id="fetch-btn" class="px-6 py-3 bg-indigo-600 text-white rounded-lg">
提取HTML
</button>
</div>
<p id="error-message" class="mt-2 text-red-600 text-sm hidden"></p>
<p class="mt-2 text-amber-600 text-sm">⚠️ 注意：由於瀏覽器安全限制，僅能提取允許跨域訪問的網站</p>
</div>

<div id="result-container" class="hidden mt-6">
<h2 class="text-2xl font-bold mb-4">提取結果</h2>
<div class="flex gap-3 mb-2">
<button id="download-btn" class="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg">下載HTML</button>
<button id="copy-btn" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">複製HTML</button>
</div>
<pre id="html-content" class="bg-gray-900 text-white p-4 rounded max-h-96 overflow-auto whitespace-pre-wrap break-words"></pre>
<p class="mt-2 text-sm">字數：<span id="char-count"></span></p>
</div>

</div>
</div>
</div>

<script>
// ===== 核心 JS =====
let __htmlContent = '';
let __pageTitle = '';

async function fetchHTML(url) {
  const err = document.getElementById('error-message');
  const result = document.getElementById('result-container');

  err.classList.add('hidden');

  try {
    const res = await fetch('/fetch:' + encodeURIComponent(url));
    if (!res.ok) throw new Error(res.status);

    const html = await res.text();
    __htmlContent = html;
    __pageTitle = document.title || 'page';

    document.getElementById('html-content').textContent = html;
    document.getElementById('char-count').textContent = html.length;
    result.classList.remove('hidden');
  } catch (e) {
    err.textContent = '提取失敗：' + e.message;
    err.classList.remove('hidden');
  }
}

// 點擊提取
document.getElementById('fetch-btn').onclick = () => {
  const url = document.getElementById('url-input').value.trim();
  if (url) fetchHTML(url);
};

// 點擊下載
document.getElementById('download-btn').onclick = () => {
  if (!__htmlContent) return;
  const blob = new Blob([__htmlContent], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (__pageTitle || 'page') + '.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
};

// 點擊複製
document.getElementById('copy-btn').onclick = async () => {
  if (!__htmlContent) return;
  try {
    await navigator.clipboard.writeText(__htmlContent);
    const btn = document.getElementById('copy-btn');
    const old = btn.textContent;
    btn.textContent = '已複製 ✔';
    setTimeout(() => btn.textContent = old, 1200);
  } catch {
    alert('複製失敗（瀏覽器未允許）');
  }
};

// 自動模式 /url:xxxx
(() => {
  const path = location.pathname;
  if (!path.startsWith('/url:')) return;
  const target = decodeURIComponent(path.slice(5));
  document.getElementById('url-input').value = target;
  fetchHTML(target);
})();
</script>

</body>
</html>`;

export function layout(
  title: string,
  body: string,
  user?: { email: string },
  active?: "home" | "report",
) {
  const navLink = (href: string, label: string, page: "home" | "report") =>
    `<a href="${href}" class="text-sm font-medium ${active === page ? "text-amber-400" : "text-neutral-500 hover:text-neutral-100"}">${label}</a>`;
  const nav = user
    ? `<nav class="flex items-center gap-4">${navLink("/", "Home", "home")}${navLink("/report", "Report", "report")}</nav>`
    : "";
  return `<!doctype html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} · My Amal</title><script src="https://unpkg.com/htmx.org@2.0.4"></script><script>(function(){var key='timezone=';if(!document.cookie.split('; ').some(function(x){return x.indexOf(key)===0;})){document.cookie=key+encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone)+';path=/;max-age=31536000;SameSite=Lax';location.reload();}})();</script><script src="https://cdn.tailwindcss.com"></script><script>
// Long-press (~500ms) on a prayer circle opens the datetime dialog instead of toggling.
// On dialog submit, POST /habits/prayer with the chosen datetime as logged_at.
(function () {
  var PRESS_MS = 500, timer = null, target = null, fired = false;
  function start(e) {
    var btn = e.target.closest('.prayer-circle');
    if (!btn || btn.disabled) return;
    target = btn; fired = false;
    timer = setTimeout(function () {
      fired = true;
      var dialog = document.getElementById('prayer-log-dialog');
      document.getElementById('prayer-log-label').textContent =
        btn.getAttribute('data-prayer') + ' — ' + btn.getAttribute('data-date');
      var input = document.getElementById('prayer-log-datetime');
      var now = new Date();
      input.value = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 16);
      dialog.showModal();
    }, PRESS_MS);
  }
  function cancel() { clearTimeout(timer); }
  function blockClick(e) {
    if (fired) { e.preventDefault(); e.stopPropagation(); fired = false; }
  }
  document.addEventListener('pointerdown', start);
  document.addEventListener('pointerup', cancel);
  document.addEventListener('pointercancel', cancel);
  document.addEventListener('pointermove', cancel);
  document.addEventListener('click', blockClick, true);
  document.addEventListener('htmx:afterSwap', function () {
    // re-swapped circles are fresh nodes; listeners are on document so nothing to rebind
  });
  document.getElementById('prayer-log-cancel').addEventListener('click', function () {
    document.getElementById('prayer-log-dialog').close();
  });
  document.getElementById('prayer-log-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = target; var dialog = document.getElementById('prayer-log-dialog');
    var val = document.getElementById('prayer-log-datetime').value;
    if (!btn || !val) return;
    var body = new URLSearchParams({
      prayer: btn.getAttribute('data-prayer'),
      date: btn.getAttribute('data-date'),
      datetime: val,
    });
    fetch('/habits/prayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    }).then(function (r) {
      if (r.ok) { window.location.reload(); dialog.close(); }
    });
  });
})();</script></head><body class="bg-neutral-950 text-neutral-100"><header class="border-b border-neutral-800 bg-neutral-950"><div class="mx-auto flex max-w-xl items-center justify-between px-5 py-4"><div class="flex items-center gap-6"><a href="/" class="font-semibold tracking-tight text-neutral-50">My Amal</a>${nav}</div>${user ? `<form method="post" action="/logout"><button class="text-sm font-medium text-red-500/50 hover:text-red-500">Logout</button></form>` : ""}</div></header><main class="mx-auto max-w-xl px-5 py-8">${body}</main></body></html>`;
}

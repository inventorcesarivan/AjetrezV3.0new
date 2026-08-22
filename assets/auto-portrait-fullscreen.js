
/**
 * Auto Portrait + Fullscreen for mobile (best-effort).
 * Use: include this script in each game page (e.g., ajetrez_modo_*.html).
 * It will:
 *  - On first user interaction, request fullscreen and try to lock to 'portrait'.
 *  - Show a small overlay prompting to girar el teléfono when in landscape on iOS/Safari (no orientation lock).
 */
(function () {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isMobile) return;

  // Create rotate overlay for landscape cases (iOS can't lock orientation for pages)
  const overlay = document.createElement('div');
  overlay.id = 'ajetrez-rotate-overlay';
  overlay.style.cssText = [
    'position:fixed','inset:0','display:none','align-items:center','justify-content:center',
    'background:rgba(0,0,0,.85)','color:#fff','z-index:999999','text-align:center',
    'font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif','padding:24px'
  ].join(';');
  overlay.innerHTML = '<div style="max-width:420px"><div style="font-size:22px;font-weight:900;margin-bottom:8px">Girá el teléfono</div><div style="opacity:.85">Para jugar cómodamente, usá orientación vertical.</div></div>';
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(overlay));

  function toggleOverlay() {
    const landscape = window.matchMedia('(orientation: landscape)').matches;
    overlay.style.display = landscape ? 'flex' : 'none';
  }
  window.addEventListener('orientationchange', toggleOverlay);
  window.addEventListener('resize', toggleOverlay);
  document.addEventListener('DOMContentLoaded', toggleOverlay);

  async function goFullscreenAndPortrait() {
    try {
      // Fullscreen (best-effort; requires user gesture in most browsers)
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      // ignore
    }
    try {
      // Orientation lock (requires fullscreen and supported browsers; not iOS Safari)
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('portrait');
      }
    } catch (e) {
      // ignore
    }
  }

  // Attach once to first interaction
  let armed = true;
  function armOnce() {
    if (!armed) return;
    armed = false;
    goFullscreenAndPortrait();
    // After attempting once, keep trying when the page becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        goFullscreenAndPortrait();
      }
    });
  }
  ['click','touchend','keydown'].forEach(ev => {
    window.addEventListener(ev, armOnce, { once: true, passive: true });
  });
})();

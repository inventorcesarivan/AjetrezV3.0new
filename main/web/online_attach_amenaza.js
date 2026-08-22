
// Ajetrez Online — Attacher for amenaza (injects button + status pill and wires Supabase)
(async () => {
  const amenaza = 'amenaza';
  const SUPABASE_URL = 'https://unyomyoojfjatxrcknqu.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueW9teW9vamZqYXR4cmNrbnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjQyNTgsImV4cCI6MjA3Mzk0MDI1OH0.ob5n4Ae7UecIQ7K4IlYMkxOgoDgZxg2VcgTFwKHOgsA';

  // Find right-ctrls or fallback to bottom bar
  const container = document.querySelector('.right-ctrls') || document.querySelector('#bottomBar') || document.body;
  // Create UI
  const btn = document.createElement('button');
  btn.id = 'btn-online-' + amenaza;
  btn.className = 'btn small';
  btn.textContent = 'Online';
  btn.title = 'Jugar online (' + amenaza + ')';

  const pill = document.createElement('div');
  pill.id = 'online-' + amenaza + '-status';
  pill.setAttribute('aria-live', 'polite');
  pill.style.cssText = 'display:inline-block;margin-left:10px;padding:4px 10px;border-radius:12px;background:rgba(0,0,0,.7);color:#fff;border:1px solid #ffcc00;font-size:13px;line-height:1.1;max-width:50vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';

  // Insert into container
  container.appendChild(btn);
  container.appendChild(pill);

  const setStatus = (t) => { pill.textContent = t; pill.title = t; console.log('[online-'+amenaza+']', t); };

  // Lazy import client
  let svc = null;
  async function ensureSvc() {
    if (svc) return svc;
    try {
      const mod = await import('./web/online.js');
      svc = await mod.initOnline({
        supabaseUrl: SUPABASE_URL,
        supabaseAnonKey: SUPABASE_ANON_KEY,
        variant: amenaza,
        getLocalState: () => window.Ajetrez?.exportState?.() ?? {},
        applyRemoteEvent: (ev) => { try { window.Ajetrez?.applyEvent?.(ev) } catch(e) { console.error(e) } },
        onStatus: (s) => setStatus(s.type)
      });
      setStatus('✅ Conectado (auth ok).');
      return svc;
    } catch (e) {
      setStatus('❌ No se pudo cargar /web/online.js o conectar.');
      console.error(e);
      throw e;
    }
  }

  btn.addEventListener('click', async () => {
    try {
      const s = await ensureSvc();
      const g = await s.quickMatch();
      await s.subscribeToGame(g.id);
      setStatus(`🎮 Partida ${g.code} — ${g.status}`);
    } catch (e) {}
  });

  // Hooks used by your engine
  window.onLocalMove = (move) => svc?.send({ kind: 'move', payload: move });
  window.onSectionShift = (shift) => svc?.send({ kind: 'shift', payload: shift });
  window.onPromote = (prom) => svc?.send({ kind: 'promote', payload: prom });
})();

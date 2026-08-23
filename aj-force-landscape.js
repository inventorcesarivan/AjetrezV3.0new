// aj-force-landscape.js — fuerza orientación horizontal sin mostrar carteles
(function(){
  const canLock = () => !!(screen && screen.orientation && typeof screen.orientation.lock === 'function');
  async function tryLock(){
    try { if (canLock()) await screen.orientation.lock('landscape'); } catch(e){}
  }
  // intentos de refuerzo
  tryLock();
  setTimeout(tryLock, 200);
  setTimeout(tryLock, 800);
  window.addEventListener('click', tryLock, { once:true, passive:true });
  window.addEventListener('touchend', tryLock, { once:true, passive:true });
  window.addEventListener('keydown', tryLock, { once:true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tryLock(); });
  document.addEventListener('fullscreenchange', tryLock);
  window.addEventListener('orientationchange', tryLock);
})();
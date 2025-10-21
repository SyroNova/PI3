(function(){
  const STORAGE_KEY = 'electromed-theme';
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem(STORAGE_KEY);
  const initial = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(initial);

  function applyTheme(theme){
    const root = document.documentElement; // <html>
    if(theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    localStorage.setItem(STORAGE_KEY, theme);
    updateToggles(theme);
    // Notify listeners (e.g., charts) about theme change
    try { window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } })); } catch(_){}
  }

  function toggleTheme(){
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function updateToggles(theme){
    document.querySelectorAll('[data-action="toggle-theme"]').forEach(btn => {
      btn.setAttribute('aria-pressed', theme === 'dark');
      btn.title = theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
      btn.textContent = theme === 'dark' ? '🌙' : '☀️';
    });
  }

  // wire buttons
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action="toggle-theme"]');
    if(!el) return;
    e.preventDefault();
    toggleTheme();
  });
})();

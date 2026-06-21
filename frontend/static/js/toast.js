/**
 * Sistema de toast notifications para WipMind.
 */

(function () {
  let container = null;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, type = 'default', duration = 4000) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    getContainer().appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(40px)';
      el.style.transition = 'all .3s';
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  window.Toast = {
    success: (msg) => showToast(msg, 'success'),
    error:   (msg) => showToast(msg, 'error'),
    warning: (msg) => showToast(msg, 'warning'),
    info:    (msg) => showToast(msg, 'default'),
  };
})();

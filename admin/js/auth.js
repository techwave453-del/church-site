/* Admin authentication module */
export async function api(url, options = {}) {
  return fetch(url, { credentials: 'include', ...options });
}

export async function checkApiStatus(statusEl) {
  try {
    const response = await api('/api/health');
    const data = await response.json();
    statusEl.textContent = response.ok ? `API · ${data.database || 'online'}` : 'API error';
    statusEl.className = `status ${response.ok ? 'ok' : 'bad'}`;
    return response.ok;
  } catch {
    statusEl.textContent = 'API offline';
    statusEl.className = 'status bad';
    return false;
  }
}

export async function login(username, password) {
  return api('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: username.trim(), password }) });
}

export async function logout() { return api('/api/admin/logout', { method: 'POST' }); }
export async function getSession() { return api('/api/admin/session'); }

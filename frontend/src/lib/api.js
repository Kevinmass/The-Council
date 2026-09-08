// Cliente del backend Express (/api/*). En dev, Vite proxya a :3000.

async function j(path, opts) {
  const res = await fetch(path, opts);
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function getHealth() {
  try {
    const { data } = await j('/api/health');
    return data; // { success, status, mode, llm, services }
  } catch {
    return { success: false, mode: 'unavailable', services: {} };
  }
}

export async function getConfig() {
  try {
    const { data } = await j('/api/config');
    return data?.success ? data.config : null;
  } catch {
    return null;
  }
}

export async function runCouncil({ packageText, agents, rounds }) {
  try {
    const { ok, data } = await j('/api/council', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ package: packageText, agents, rounds }),
    });
    if (ok && data?.success) return { ok: true, data };
    return {
      ok: false,
      error: data?.error || 'El consejo devolvió un error',
      details: data?.details,
    };
  } catch (e) {
    return { ok: false, error: 'No se pudo conectar con el servidor' };
  }
}

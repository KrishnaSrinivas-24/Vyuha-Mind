const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

async function postJson(path, payload) {
  const response = await fetch(`${BACKEND_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      detail = body?.detail || detail;
    } catch {
      // no-op
    }
    throw new Error(detail);
  }

  return response.json();
}

export async function runPipeline(payload) {
  return postJson('/pipeline/run', payload);
}

export async function parsePRD(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BACKEND_BASE}/prd/parse`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      detail = body?.detail || detail;
    } catch {
      // no-op
    }
    throw new Error(detail);
  }

  return response.json();
}

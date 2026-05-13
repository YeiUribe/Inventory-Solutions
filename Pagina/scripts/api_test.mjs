import 'dotenv/config';
import fs from 'fs/promises';

const API_BASE = process.env.VITE_API_URL || `http://localhost:3001`;

const log = (tag, msg) => console.log(`${new Date().toISOString()} [${tag}] ${msg}`);

const request = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch(e) { json = text; }
  return { status: res.status, body: json };
};

const run = async () => {
  const results = [];

  // 1. Login
  try {
    const testUser = process.env.TEST_USER || process.env.USERNAME || 'joquendo';
    const testPass = process.env.TEST_PASS || process.env.PASSWORD || '1234';
    const r = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: testUser, password: testPass }) });
    results.push({ name: 'Login', ok: r.status === 200, resp: r });
    log('TEST', `Login -> ${r.status}`);
  } catch (err) { results.push({ name: 'Login', ok: false, error: err.message }); }

  // 2. Get inventory
  try {
    const r = await request('/api/inventory');
    results.push({ name: 'Get inventory', ok: r.status === 200, resp: r });
    log('TEST', `Get inventory -> ${r.status}`);
  } catch (err) { results.push({ name: 'Get inventory', ok: false, error: err.message }); }

  // 3. Create inventory item
  const testId = `TEST-${Date.now().toString().slice(-6)}`;
  try {
    const payload = { activo_fijo: testId, device: 'Auto Test Device', category: 'Portatil', status: 'Disponible' };
    const r = await request('/api/inventory', { method: 'POST', body: JSON.stringify(payload) });
    results.push({ name: 'Create inventory', ok: r.status === 201, resp: r });
    log('TEST', `Create inventory -> ${r.status}`);
  } catch (err) { results.push({ name: 'Create inventory', ok: false, error: err.message }); }

  // 4. Update inventory item
  try {
    const payload = { status: 'Mantenimiento' };
    const r = await request(`/api/inventory/${testId}`, { method: 'PUT', body: JSON.stringify(payload) });
    results.push({ name: 'Update inventory', ok: r.status === 200, resp: r });
    log('TEST', `Update inventory -> ${r.status}`);
  } catch (err) { results.push({ name: 'Update inventory', ok: false, error: err.message }); }

  // 5. Delete inventory item
  try {
    const r = await request(`/api/inventory/${testId}`, { method: 'DELETE' });
    results.push({ name: 'Delete inventory', ok: r.status === 200, resp: r });
    log('TEST', `Delete inventory -> ${r.status}`);
  } catch (err) { results.push({ name: 'Delete inventory', ok: false, error: err.message }); }

  // 6. Create assignment (use an existing activo from seed if available)
  try {
    const rInventory = await request('/api/inventory');
    const sample = Array.isArray(rInventory.body) && rInventory.body.length ? rInventory.body[0] : null;
    if (!sample) {
      results.push({ name: 'Create assignment', ok: false, error: 'No inventory sample available' });
      log('TEST', 'Create assignment -> no inventory sample');
    } else {
      const payload = { activo_fijo: sample.id, cedula: sample.cedula || '1007413774' };
      const r = await request('/api/asignaciones', { method: 'POST', body: JSON.stringify(payload) });
      results.push({ name: 'Create assignment', ok: r.status === 201, resp: r });
      log('TEST', `Create assignment -> ${r.status}`);

      // 7. Devolver
      const r2 = await request(`/api/asignaciones/devolver/${sample.id}`, { method: 'PUT' });
      results.push({ name: 'Return assignment', ok: r2.status === 200, resp: r2 });
      log('TEST', `Return assignment -> ${r2.status}`);
    }
  } catch (err) { results.push({ name: 'Create assignment', ok: false, error: err.message }); }

  // 8. Usuarios CRUD
  try {
    const rList = await request('/api/usuarios');
    results.push({ name: 'Users list', ok: rList.status === 200, resp: rList });
    log('TEST', `Users list -> ${rList.status}`);

    const newUser = { cedula: `999${Date.now().toString().slice(-6)}`, usuario_login: `testu${Date.now().toString().slice(-4)}`, password_hash: 'pass123', id_rol: 3 };
    const rCreate = await request('/api/usuarios', { method: 'POST', body: JSON.stringify(newUser) });
    results.push({ name: 'Create user', ok: rCreate.status === 201, resp: rCreate });
    log('TEST', `Create user -> ${rCreate.status}`);

    const createdId = rCreate?.resp?.body?.id_usuario || (rCreate?.resp && rCreate.resp.id_usuario) || null;
    // Some controllers return object; we'll try to find id in response
    let idToUse = createdId;
    if (!idToUse && Array.isArray(rList.body) && rList.body.length) {
      // fallback: pick first
      idToUse = rList.body[0]?.id;
    }

    if (idToUse) {
      const rUpdate = await request(`/api/usuarios/${idToUse}`, { method: 'PUT', body: JSON.stringify({ nombre: 'Mod Test' }) });
      results.push({ name: 'Update user', ok: rUpdate.status === 200, resp: rUpdate });
      log('TEST', `Update user -> ${rUpdate.status}`);

      const rDelete = await request(`/api/usuarios/${idToUse}`, { method: 'DELETE' });
      results.push({ name: 'Delete user', ok: rDelete.status === 200, resp: rDelete });
      log('TEST', `Delete user -> ${rDelete.status}`);
    } else {
      results.push({ name: 'Update/Delete user', ok: false, error: 'No user id available to update/delete' });
    }
  } catch (err) { results.push({ name: 'Users CRUD', ok: false, error: err.message }); }

  // Print summary
  console.log('\n=== TEST SUMMARY ===');
  results.forEach(r => {
    console.log(`${r.name}: ${r.ok ? 'OK' : 'FAIL'}`);
    if (!r.ok) console.log('  ->', r.error || r.resp?.body || r.resp?.status);
  });

  // Save results to file
  try {
    await fs.writeFile('./api_test_results.json', JSON.stringify({ date: new Date().toISOString(), results }, null, 2));
    console.log('Results saved to ./api_test_results.json');
  } catch (e) {
    console.error('Could not save results:', e.message);
  }
};

run().catch(e => { console.error('Fatal test runner error:', e); process.exit(1); });

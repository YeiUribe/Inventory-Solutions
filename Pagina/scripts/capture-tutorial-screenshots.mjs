import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.APP_URL || 'http://127.0.0.1:4173';
const outDir = path.resolve('docs/tutorial/img');

const ensureDir = async () => {
  await fs.mkdir(outDir, { recursive: true });
};

const waitForApp = async (page) => {
  for (let i = 0; i < 30; i += 1) {
    try {
      await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 2000 });
      return;
    } catch {
      await page.waitForTimeout(500);
    }
  }
  throw new Error(`No se pudo abrir la app en ${baseUrl}`);
};

const capture = async () => {
  await ensureDir();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    await waitForApp(page);

    await page.screenshot({ path: path.join(outDir, 'paso-1-login.png'), fullPage: true });

    await page.getByPlaceholder('Ej. admin, jefe, operador...').fill('admin');
    await page.getByPlaceholder('Clave (123)').fill('123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await page.waitForURL('**/dashboard/**', { timeout: 10000 });
    await page.waitForSelector('table tbody tr');

    await page.screenshot({ path: path.join(outDir, 'paso-2-inventario.png'), fullPage: true });

    const searchInput = page.getByPlaceholder('Buscar por ID o nombre...');
    await searchInput.fill('Laptop');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, 'paso-3-busqueda.png'), fullPage: true });

    await searchInput.fill('');
    await page.locator('table tbody tr').first().click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, 'paso-4-detalles.png'), fullPage: true });

    await page.locator('.dashboard-actions').scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(outDir, 'paso-5-acciones.png'), fullPage: true });

    await page.getByRole('link', { name: 'Historial' }).click();
    await page.waitForURL('**/dashboard/history', { timeout: 10000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, 'paso-6-historial.png'), fullPage: true });

    await page.getByRole('link', { name: 'Reportes' }).click();
    await page.waitForURL('**/dashboard/reports', { timeout: 10000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, 'paso-7-reportes.png'), fullPage: true });

    console.log('Capturas generadas en docs/tutorial/img');
  } finally {
    await context.close();
    await browser.close();
  }
};

capture().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const { test, expect } = require('@playwright/test');

async function open(page) {
  await page.route('**/*', route => route.request().url().startsWith('http://127.0.0.1:4174') ? route.continue() : route.fulfill({ contentType: 'text/javascript', body: '' }));
  await page.goto('/');
  await expect(page.locator('.hub-tab')).toHaveCount(8);
  await expect(page.getByRole('button', { name: 'Script' })).toHaveCount(0);
}
const sideWidth = page => page.locator('#hub-side').evaluate(n => n.getBoundingClientRect().width);

test('el menú lateral navega y se esconde recordando la elección', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page);
  await page.getByRole('button', { name: 'Tracker' }).click();
  await expect(page.locator('#view-tracker')).toHaveClass(/active/);
  await expect(page.getByRole('button', { name: 'Tracker' })).toHaveAttribute('aria-current', 'page');

  await page.getByRole('button', { name: 'Esconder menú' }).click();
  await expect(page.getByRole('button', { name: 'Mostrar menú' })).toHaveAttribute('aria-expanded', 'false');
  await expect.poll(() => sideWidth(page)).toBe(60);
  await expect(page.locator('.hub-tab .tlabel').first()).toBeHidden();
  await expect.poll(() => page.locator('#hub-views').evaluate(n => n.getBoundingClientRect().left)).toBe(60);

  await page.reload();
  await expect(page.locator('html')).toHaveClass(/side-collapsed/);
  await page.getByRole('button', { name: 'Mostrar menú' }).click();
  await expect.poll(() => sideWidth(page)).toBe(228);
});

test('en pantalla chica arranca escondido y se cierra al elegir sección', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await open(page);
  await expect.poll(() => sideWidth(page)).toBe(52);
  await page.getByRole('button', { name: 'Mostrar menú' }).click();
  await expect.poll(() => sideWidth(page)).toBe(228);
  await expect.poll(() => page.locator('#hub-views').evaluate(n => n.getBoundingClientRect().left)).toBe(52);
  await page.getByRole('button', { name: 'Calendario' }).click();
  await expect.poll(() => sideWidth(page)).toBe(52);
});

test('el tema claro se activa, se recuerda y llega a la guía', async ({ page }) => {
  await open(page);
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await expect.poll(bg).toBe('rgb(14, 16, 22)');

  await page.getByRole('button', { name: 'Modo claro' }).click();
  await expect.poll(bg).toBe('rgb(246, 244, 238)');
  const guide = page.frameLocator('.hub-frame').locator('html');
  await expect(guide).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('#hub-side')).toHaveCSS('background-color', 'rgb(21, 24, 36)');

  await page.reload();
  await expect.poll(bg).toBe('rgb(246, 244, 238)');
  await expect(guide).toHaveAttribute('data-theme', 'light');

  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  await expect.poll(bg).toBe('rgb(14, 16, 22)');
  await expect(guide).not.toHaveAttribute('data-theme', 'light');
});

test('el guion une los bloques pedidos sin perder letra', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Guion' }).click();
  await expect(page.locator('#view-guion tr[data-row]')).toHaveCount(21);
  await expect(page.locator('tr[data-row="r0282"], tr[data-row="r0431"]')).toHaveCount(0);
  const first = page.locator('tr[data-row="r0231"]');
  await expect(first.locator('.g-time')).toContainText('00:23.1');
  await expect(first.locator('.g-time')).toContainText('00:30.8');
  await expect(first.locator('.g-line')).toHaveCount(2);
  const second = page.locator('tr[data-row="r0308"]');
  await expect(second.locator('.g-time')).toContainText('00:38.4');
  await expect(second.locator('.g-line')).toHaveCount(2);
  // la pasarela se divide: poses (swipes) y combate lateral
  const combat = page.locator('tr[data-row="r0384"]');
  await expect(combat.locator('.g-time')).toContainText('00:46.3');
  await expect(combat.locator('.g-line')).toHaveCount(2);
  // tramos de la maqueta del 11/11: el giro a la subjetiva llega antes de 00:54
  await expect(page.locator('tr[data-row="r0465"] .g-time')).toContainText('00:51.7');
  await expect(page.locator('tr[data-row="r0465"] .g-line')).toHaveCount(2);
  await expect(page.locator('tr[data-row="r0546"] .g-line')).toHaveCount(2);
  await expect(page.locator('tr[data-row="r0624"] .g-time')).toContainText('01:01.4');
});

test('reuniones y feedback muestran su contenido por sección', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Reuniones' }).click();
  await expect(page.locator('[data-meeting="guion-2026-11-06"]')).toHaveAttribute('open', '');
  await expect(page.getByRole('heading', { name: 'Viernes 6 de noviembre de 2026' })).toBeVisible();
  const meeting = page.locator('[data-meeting="guion-2026-11-06"]');
  await expect(meeting.locator('.mtg-pill')).toHaveCount(5);
  await expect(meeting.getByRole('heading', { name: 'Pasos a seguir' })).toBeVisible();
  await expect(meeting.getByRole('heading', { name: 'Se definió' })).toBeHidden();
  await meeting.getByText('Ver todo lo que se habló').click();
  await expect(meeting.getByRole('heading', { name: 'Se definió' })).toBeVisible();
  await page.getByRole('button', { name: 'Feedback' }).click();
  const ui = page.locator('#view-feedback [data-dept="ui"]');
  await expect(ui.getByRole('heading', { name: 'UI de TV + Control' })).toBeVisible();
  await expect(ui.locator('.fb-list dt')).toHaveCount(8);
  await expect(ui.getByRole('link', { name: /Loom/ })).toHaveAttribute('href', /loom\.com\/share\/02c2358e/);
});

test('lo pendiente del guion se ve en rojo sin cambiar el texto', async ({ page }) => {
  const text = 'decidido\n\nPARA DEFINIR\n- algo';
  await page.addInitScript(t => {
    localStorage.setItem('golden_guion_v1', JSON.stringify({ 'r0308:action': t, 'r0231:camera': 'ok\nFede - DEFINIR\nsigue' }));
    localStorage.setItem('golden_edit', '1');
  }, text);
  await open(page);
  await page.getByRole('button', { name: 'Guion' }).click();
  const cell = page.locator('textarea[data-key="r0308:action"]');
  await expect(cell).toHaveValue(text);
  const blue = page.locator('tr[data-row="r0308"] .g-pending');
  await expect(blue).toHaveText(['PARA DEFINIR', '- algo']);
  await expect(blue.first()).toHaveCSS('color', 'rgb(255, 107, 107)');
  await expect(page.locator('tr[data-row="r0231"] .g-pending')).toHaveText(['Fede - DEFINIR']);
  await cell.fill('nuevo\nPARA DEFINIR x');
  await expect(blue).toHaveText(['PARA DEFINIR x']);
});

test('las secuencias del guion siguen la numeración acordada', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Guion' }).click();
  const seq = { r0000: 'S01', r0096: 'S01', r0160: 'S01', r0231: 'S01', r0308: 'S02', r0384: 'S02', r0465: 'S03', r0546: 'S03', r0624: 'S04', r0701: 'S04', r0782: 'S04', r0849: 'S05', r0949: 'S06', r1070: 'S06', r1119: 'S07', r1231: 'S08', r1270: 'S08', r1381: 'S09', r1502: 'S09', r1599: 'S10', r1750: 'S10' };
  for (const [row, label] of Object.entries(seq)) await expect(page.locator(`tr[data-row="${row}"] .g-set strong`)).toHaveText(new RegExp('^' + label + ' · '));
});

test('dirección lista lo que falta definir y lleva al bloque del guion', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('golden_guion_v1')) localStorage.setItem('golden_guion_v1', JSON.stringify({
      'r0308:action': 'decidido\n\nPARA DEFINIR\n- Cómo mata\n- Cuánto dura', 'r0231:camera': 'ok\nFede no sabe - DEFINIR', 'r0160:ui': 'UI normal',
    }));
  });
  await open(page);
  await page.getByRole('button', { name: 'Dirección' }).click();
  await expect(page.getByRole('heading', { name: 'Por responder de las reuniones' })).toBeVisible();
  const card = page.locator('#view-direccion .note-card[data-row="r0308"]');
  await expect(card.locator('.dir-list li')).toHaveText(['AcciónCómo mata', 'AcciónCuánto dura']);
  await expect(page.locator('#view-direccion .note-card[data-row="r0231"] .dir-list li')).toHaveText(['CámaraFede no sabe - DEFINIR']);
  await expect(page.locator('#view-direccion .note-card[data-row="r0160"]')).toHaveCount(0);
  await card.getByRole('button', { name: 'Ver en Guion' }).click();
  await expect(page.locator('#view-guion')).toHaveClass(/active/);
  await expect(page.locator('tr[data-row="r0308"]')).toBeInViewport();
});

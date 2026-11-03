const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==', 'base64');
const singleGif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAAAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
const gif = Buffer.concat([singleGif.subarray(0, 19), singleGif.subarray(19, -1), singleGif.subarray(19, -1), Buffer.from([59])]);
const seed = { tasks: [{ id: 'test-task', dept: '3d', title: 'Subte — prueba de versiones', assignee: 'be', status: 'dev', customField: 'keep me' }], scenarios: [], attachments: [], meta: { weekPlans: {} } };

async function setup(page, options = {}) {
  await page.addInitScript(({ seed, editable }) => {
    if (!localStorage.getItem('golden_tracker_v1')) localStorage.setItem('golden_tracker_v1', JSON.stringify(seed));
    if (editable) localStorage.setItem('golden_edit', '1'); else localStorage.removeItem('golden_edit');
  }, { seed: options.seed || seed, editable: options.editable !== false });
  await page.route('**/*', route => route.request().url().startsWith('http://127.0.0.1:4174') ? route.continue() : route.fulfill({ contentType: 'text/javascript', body: '' }));
  await page.goto('/'); await page.evaluate(() => window.GoldenHub.show('tracker'));
  await expect(page.locator('.kb-card')).toHaveCount(1);
  await page.locator('.kb-card').click();
}
const item = (page, name) => page.locator('.media-item').filter({ has: page.locator('.media-filename', { hasText: name }) });
async function upload(page, name, bytes = png, mime = 'image/png') {
  await page.locator('.media-file-input').setInputFiles({ name, mimeType: mime, buffer: bytes });
  await expect(item(page, name)).toBeVisible();
  await expect(page.locator('.task-media')).toHaveAttribute('aria-busy', 'false');
}
async function save(page, name, values = {}) {
  const article = item(page, name);
  if (values.version != null) await article.getByLabel('Número de versión').fill(String(values.version));
  if (values.status) await article.getByLabel('Estado del archivo').selectOption(values.status);
  if (values.feedback != null) await article.getByLabel('Feedback del archivo').fill(values.feedback);
  await article.getByRole('button', { name: 'Guardar versión y feedback' }).click();
  await expect(page.locator('.media-message')).toHaveText('Versión y feedback guardados.');
}

test('PNG + animated GIF persist locally; versions, final rollover, feedback limit and exact download', async ({ page }) => {
  await setup(page);
  await upload(page, 'subte.png'); await save(page, 'subte.png', { status: 'final', feedback: 'Primera revisión.' });
  await upload(page, 'subte.gif', gif, 'image/gif');
  await expect(item(page, 'subte.gif').getByLabel('Número de versión')).toHaveValue('2');
  await item(page, 'subte.gif').getByLabel('Feedback del archivo').fill('a'.repeat(310));
  await expect(item(page, 'subte.gif').getByLabel('Feedback del archivo')).toHaveValue('a'.repeat(300));
  await expect(item(page, 'subte.gif').locator('.media-count')).toHaveText('300/300');
  await save(page, 'subte.gif', { status: 'final' });
  await expect(item(page, 'subte.png')).toHaveClass(/media-old/);
  await expect(item(page, 'subte.gif')).toHaveClass(/media-final/);
  await expect(item(page, 'subte.png').getByLabel('Feedback del archivo')).toHaveValue('Primera revisión.');
  const downloadPromise = page.waitForEvent('download');
  await item(page, 'subte.gif').getByRole('button', { name: 'Descargar' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('v002_subte.gif');
  expect(await fs.readFile(await download.path())).toEqual(gif);
  await page.reload(); await page.evaluate(() => window.GoldenHub.show('tracker')); await page.locator('.kb-card').click();
  await expect(page.locator('.media-item')).toHaveCount(2);
  await expect(item(page, 'subte.gif').locator('img')).toHaveJSProperty('naturalWidth', 1);
  await expect(item(page, 'subte.gif').getByLabel('Feedback del archivo')).toHaveValue('a'.repeat(300));
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('golden_tracker_v1')));
  expect(saved.tasks[0].customField).toBe('keep me');
  expect(saved.attachments.every(a => !a.url && a.localKey)).toBe(true);
});

test('duplicate/invalid versions and wrong file types are rejected without losing images', async ({ page }) => {
  await setup(page); await upload(page, 'uno.png'); await upload(page, 'dos.png');
  await item(page, 'dos.png').getByLabel('Número de versión').fill('1');
  await item(page, 'dos.png').getByRole('button', { name: 'Guardar versión y feedback' }).click();
  await expect(page.locator('.media-message')).toContainText('Ya existe esa versión');
  await item(page, 'dos.png').getByLabel('Número de versión').fill('0');
  await item(page, 'dos.png').getByRole('button', { name: 'Guardar versión y feedback' }).click();
  await expect(page.locator('.media-message')).toContainText('número entero mayor');
  await page.locator('.media-file-input').setInputFiles({ name: 'falso.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
  await expect(page.locator('.media-message')).toContainText('no coincide');
  await page.locator('.media-file-input').setInputFiles({ name: 'script.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
  await expect(page.locator('.media-message')).toContainText('Elegí una imagen');
  await expect(page.locator('.media-item')).toHaveCount(2);
});

test('old thumbnail remains v001; list view and read-only viewers can open and download', async ({ page }) => {
  const legacy = JSON.parse(JSON.stringify(seed)); legacy.tasks[0].thumbUrl = 'data:image/png;base64,' + png.toString('base64');
  await setup(page, { seed: legacy });
  await expect(page.locator('.media-item')).toHaveCount(1);
  await upload(page, 'nueva.png'); await save(page, 'nueva.png', { status: 'old', version: 7, feedback: '<b>Revisar luz</b>' });
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await page.getByRole('button', { name: 'Lista', exact: false }).click();
  await page.getByRole('button', { name: 'Imágenes, GIF y videos (2)' }).click();
  await expect(page.locator('.media-item')).toHaveCount(2);
});

test('read-only media have no editing controls, feedback is plain text and downloading works', async ({ page }) => {
  const readonly = JSON.parse(JSON.stringify(seed));
  readonly.attachments = [{ id: 'existing-image', taskId: 'test-task', url: 'data:image/gif;base64,' + gif.toString('base64'), mime: 'image/gif', name: 'final.gif', version: 3, status: 'final', feedback: '<b>Feedback literal</b>' }];
  await setup(page, { seed: readonly, editable: false });
  await expect(page.locator('.media-file-input')).toHaveCount(0);
  await expect(page.getByLabel('Feedback del archivo')).toHaveCount(0);
  await expect(page.locator('.media-feedback-ro')).toHaveText('<b>Feedback literal</b>');
  await expect(page.locator('.media-feedback-ro b')).toHaveCount(0);
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Descargar' }).click();
  expect((await download).suggestedFilename()).toBe('v003_final.gif');
});

test('mobile dialog keeps image controls within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page); await upload(page, 'imagen.png');
  const sizes = await page.locator('.kb-modal').evaluate(n => ({ width: n.getBoundingClientRect().width, scroll: n.scrollWidth, client: n.clientWidth }));
  expect(sizes.width).toBeLessThanOrEqual(390); expect(sizes.scroll).toBeLessThanOrEqual(sizes.client);
});

for (const view of ['board', 'list']) test(`+ Imagen / GIF opens the computer file chooser from ${view}`, async ({ page }) => {
  await setup(page);
  await page.getByRole('button', {name:'Cerrar',exact:true}).click();
  if (view === 'list') await page.getByRole('button', {name:'Lista',exact:false}).click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', {name:'＋ Imagen / GIF / MP4',exact:true}).click();
  await (await chooser).setFiles({name:'desde-boton.png',mimeType:'image/png',buffer:png});
  await expect(item(page, 'desde-boton.png')).toBeVisible();
});

test('locked image entry explains how to upload and opens the uploader after unlocking', async ({ page }) => {
  await setup(page, {editable:false});
  await page.getByRole('button', {name:'Cerrar',exact:true}).click();
  await page.getByRole('button', {name:'＋ Imagen / GIF / MP4',exact:true}).click();
  const unlock = page.getByRole('button', {name:'Activar edición para subir archivos'});
  await expect(unlock).toBeInViewport();
  await expect(page.locator('.media-file-input')).toHaveCount(0);
  page.once('dialog', dialog=>dialog.dismiss()); await unlock.click();
  await expect(page.locator('.media-file-input')).toHaveCount(0);
  page.once('dialog', dialog=>dialog.accept('test-only-edit-key')); await unlock.click();
  const uploadButton = page.getByRole('button', {name:'＋ Subir imagen, GIF o MP4',exact:true});
  await expect(uploadButton).toBeInViewport();
  const chooser = page.waitForEvent('filechooser'); await uploadButton.click();
  await (await chooser).setFiles({name:'desbloqueada.gif',mimeType:'image/gif',buffer:gif});
  await expect(item(page, 'desbloqueada.gif')).toBeVisible();
});

// Supabase protocol mock: independent JSONB rows, persisted across reloads; never a production request.
const cloudScript = `
window.GOLDEN_CONFIG = {supabaseUrl:'https://mock.invalid',supabaseAnonKey:'test-only',docId:'test'};
const initial = ${JSON.stringify(seed)};
window.__cloud = { rows: JSON.parse(localStorage.getItem('cloud-test-rows') || 'null') || initial.tasks.map(t=>({id:t.id,doc_id:'test',kind:'task',pos:0,data:t})), files:{},failUpload:false,failSave:false,removed:[],ranges:[] };
const cloud=window.__cloud, persist=()=>localStorage.setItem('cloud-test-rows',JSON.stringify(cloud.rows));
window.supabase={createClient:()=>({
 from(table){const q={filters:[],op:'select',values:null,start:0,end:999,
  select(){return this},eq(k,v){this.filters.push([k,v]);return this},order(){return this},range(a,b){this.start=a;this.end=b;cloud.ranges.push(a);return this},
  upsert(rows){this.op='upsert';this.values=Array.isArray(rows)?rows:[rows];return this},delete(){this.op='delete';return this},neq(){return this},
  then(resolve,reject){return Promise.resolve().then(()=>{
   if(table==='segments')return {data:[],error:null};
   const matches=r=>this.filters.every(([k,v])=>(k==='data->>taskId'?r.data.taskId:r[k])===v);
   if(this.op==='upsert'){
    if(cloud.failSave&&this.values.some(r=>r.kind==='attachment'))return {data:null,error:{message:'No se pudo guardar la versión'}};
    this.values.forEach(row=>{const i=cloud.rows.findIndex(r=>r.id===row.id);if(i<0)cloud.rows.push(structuredClone(row));else cloud.rows[i]=structuredClone(row)});persist();return {data:null,error:null};
   }
   if(this.op==='delete'){cloud.rows=cloud.rows.filter(r=>!matches(r));persist();return {error:null}};
   return {data:cloud.rows.filter(matches).slice(this.start,this.end+1).map(r=>structuredClone(r)),error:null};
  }).then(resolve,reject)}
 };return q},
 channel(){return {on(_kind,_options,fn){cloud.notify=fn;return this},subscribe(){}}},
 storage:{from(){return {
  async upload(path,file,options){if(cloud.failUpload)return {error:{message:'No se pudo subir el archivo'}};const bytes=new Uint8Array(await file.arrayBuffer());cloud.files[path]={mime:file.type,url:'data:'+file.type+';base64,'+btoa(String.fromCharCode(...bytes))};return {error:null}},
  getPublicUrl(path){return {data:{publicUrl:cloud.files[path].url}}},
  async remove(paths){paths.forEach(p=>{delete cloud.files[p];cloud.removed.push(p)});return {error:null}}
 }}
}})};
`;
async function setupCloud(page) {
  await page.addInitScript(() => localStorage.setItem('golden_edit', '1'));
  await page.route('**/*', route => route.request().url().startsWith('http://127.0.0.1:4174') ? route.continue() : route.fulfill({ contentType: 'text/javascript', body: route.request().url().includes('supabase-js') ? cloudScript : '' }));
  await page.goto('/'); await page.evaluate(() => window.GoldenHub.show('tracker'));
  await page.locator('.kb-card').click();
}

test('MP4 plays, persists after reload, keeps earlier images and downloads the original bytes', async ({ page }) => {
  const mp4 = await fs.readFile(path.join(__dirname, 'fixtures/review.mp4'));
  await setup(page);
  await upload(page, 'referencia.png');
  await save(page, 'referencia.png', { status: 'final', feedback: 'Referencia anterior' });
  await upload(page, 'revision.mp4', mp4, 'video/mp4');
  const video = item(page, 'revision.mp4').locator('video');
  await expect(video).toHaveJSProperty('controls', true);
  await expect(video).toHaveJSProperty('videoWidth', 160);
  await video.evaluate(async v => { await v.play(); });
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(0);
  await save(page, 'revision.mp4', { status: 'final', feedback: 'Video aprobado' });
  await expect(item(page, 'referencia.png')).toHaveClass(/media-old/);
  await page.reload(); await page.evaluate(() => window.GoldenHub.show('tracker'));
  await expect(page.locator('.kb-card video')).toHaveCount(1);
  await page.locator('.kb-card').click();
  await expect(item(page, 'revision.mp4').locator('video')).toHaveJSProperty('videoWidth', 160);
  await expect(item(page, 'revision.mp4').getByLabel('Feedback del archivo')).toHaveValue('Video aprobado');
  const pending = page.waitForEvent('download');
  await item(page, 'revision.mp4').getByRole('button', {name:'Descargar'}).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe('v002_revision.mp4');
  expect(await fs.readFile(await download.path())).toEqual(mp4);
  await expect(page.locator('.media-item')).toHaveCount(2);
});

test('invalid and oversized MP4 are rejected without saving an attachment', async ({ page }) => {
  await setup(page);
  await page.locator('.media-file-input').setInputFiles({name:'falso.mp4',mimeType:'video/mp4',buffer:png});
  await expect(page.locator('.media-message')).toContainText('no coincide');
  const sizeError = await page.evaluate(async () => {
    try { await GoldenTrackerMedia.validate(new File([new Uint8Array(GoldenTrackerMedia.MAX_BYTES+1)], 'grande.mp4', {type:'video/mp4'})); }
    catch(e) { return e.message; }
  });
  expect(sizeError).toContain('50 MB');
  await expect(page.locator('.media-item')).toHaveCount(0);
});

test('shared MP4 uses its MIME type and extension and saves independent version metadata', async ({ page }) => {
  await setupCloud(page);
  await upload(page, 'compartida.mp4', await fs.readFile(path.join(__dirname,'fixtures/review.mp4')), 'video/mp4');
  const saved = await page.evaluate(() => ({rows:__cloud.rows.filter(r=>r.kind==='attachment'), files:__cloud.files}));
  expect(saved.rows).toHaveLength(1);
  expect(saved.rows[0].data.mime).toBe('video/mp4');
  expect(saved.rows[0].data.storagePath).toMatch(/\.mp4$/);
  expect(Object.values(saved.files)[0].mime).toBe('video/mp4');
  await page.reload(); await page.evaluate(() => window.GoldenHub.show('tracker')); await page.locator('.kb-card').click();
  await expect(item(page,'compartida.mp4').locator('video')).toHaveCount(1);
});

test('shared upload is stored as a separate row, survives reload and task updates; newer final archives the previous one', async ({ page }) => {
  await setupCloud(page); await upload(page, 'compartida.png'); await save(page, 'compartida.png', { status: 'final', feedback: 'Revisada' });
  await upload(page, 'compartida.gif', gif, 'image/gif'); await save(page, 'compartida.gif', { status: 'final' });
  const rows = await page.evaluate(() => window.__cloud.rows);
  expect(rows.filter(r => r.kind === 'attachment')).toHaveLength(2);
  expect(rows.find(r => r.kind === 'task').data).toEqual(seed.tasks[0]);
  expect(rows.find(r => r.data.name === 'compartida.png').data.status).toBe('old');
  await page.locator('.kb-title-in').fill('Subte actualizado');
  await page.locator('.kb-title-in').press('Tab');
  await page.reload(); await page.evaluate(() => window.GoldenHub.show('tracker')); await page.locator('.kb-card').click();
  await expect(page.locator('.media-item')).toHaveCount(2);
  await expect(item(page, 'compartida.gif')).toHaveClass(/media-final/);
  await expect(item(page, 'compartida.png').getByLabel('Feedback del archivo')).toHaveValue('Revisada');
  await expect(page.locator('.kb-title-in')).toHaveValue('Subte actualizado');
});

test('a batch gets consecutive versions and unsaved feedback on another image is retained', async ({ page }) => {
  await setup(page); await upload(page, 'base.png');
  await item(page, 'base.png').getByLabel('Feedback del archivo').fill('Borrador que se conserva');
  await page.locator('.media-file-input').setInputFiles([
    {name:'segunda.png',mimeType:'image/png',buffer:png}, {name:'tercera.gif',mimeType:'image/gif',buffer:gif},
  ]);
  await expect(page.locator('.media-item')).toHaveCount(3);
  await expect(page.locator('.task-media')).toHaveAttribute('aria-busy','false');
  await expect(item(page, 'segunda.png').getByLabel('Número de versión')).toHaveValue('2');
  await expect(item(page, 'tercera.gif').getByLabel('Número de versión')).toHaveValue('3');
  await expect(item(page, 'base.png').getByLabel('Feedback del archivo')).toHaveValue('Borrador que se conserva');
});

test('shared loading reads beyond one page of attachment rows', async ({ page }) => {
  await page.addInitScript(({task,image}) => {
    const rows=Array.from({length:501},(_,i)=>({id:'unrelated-'+i,kind:'attachment',doc_id:'test',pos:0,data:{id:'unrelated-'+i,taskId:'other-task',version:i+1}}));
    rows.push({id:task.id,kind:'task',doc_id:'test',pos:1,data:task});
    rows.push({id:'last-image',kind:'attachment',doc_id:'test',pos:2,data:{id:'last-image',taskId:task.id,version:1,name:'ultima.png',url:image,status:'review'}});
    localStorage.setItem('cloud-test-rows',JSON.stringify(rows));
  }, {task:seed.tasks[0],image:'data:image/png;base64,'+png.toString('base64')});
  await setupCloud(page);
  await expect(page.locator('.media-item')).toHaveCount(1);
  expect(await page.evaluate(()=>window.__cloud.ranges)).toEqual([0,500]);
});

test('upload and metadata errors show failure, allow retry, and do not leave a false saved version', async ({ page }) => {
  await setupCloud(page); await page.evaluate(() => window.__cloud.failUpload = true);
  await page.locator('.media-file-input').setInputFiles({ name:'error.png', mimeType:'image/png', buffer:png });
  await expect(page.locator('.media-message')).toContainText('No se pudo subir'); await expect(page.locator('.media-item')).toHaveCount(0);
  await page.evaluate(() => { window.__cloud.failUpload=false; window.__cloud.failSave=true; });
  await page.locator('.media-file-input').setInputFiles({ name:'error.png', mimeType:'image/png', buffer:png });
  await expect(page.locator('.media-message')).toContainText('No se pudo guardar'); await expect(page.locator('.media-item')).toHaveCount(0);
  expect(await page.evaluate(() => window.__cloud.removed.length)).toBe(1);
  await page.evaluate(() => window.__cloud.failSave=false); await upload(page, 'recuperada.png');
});

test('realtime does not replace unsaved modal fields; fresh attachments appear after closing', async ({ page }) => {
  await setupCloud(page); await upload(page, 'primera.png');
  await item(page, 'primera.png').getByLabel('Feedback del archivo').fill('Borrador sin guardar');
  await page.evaluate(() => {
    const c=window.__cloud, original=c.rows.find(r=>r.kind==='attachment');
    c.rows.push({...original,id:'other-editor',data:{...original.data,id:'other-editor',name:'otra.png',version:2}}); c.notify();
  });
  await expect(item(page, 'primera.png').getByLabel('Feedback del archivo')).toHaveValue('Borrador sin guardar');
  await page.getByRole('button', { name:'Cerrar',exact:true }).click();
  await expect(page.getByRole('button', {name:'2 archivos · Ver versiones'})).toBeVisible();
  await page.locator('.kb-card').click(); await expect(page.locator('.media-item')).toHaveCount(2);
});

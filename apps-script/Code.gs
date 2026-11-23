// ربط «انضباطي سرّ تميّزي» بـ Google Drive
const TOKEN = 'ضعي_هنا_رمز_الربط_من_إعدادات_التطبيق';

function doGet(e) {
  if (!e || !e.parameter || e.parameter.token !== TOKEN) return out_({ ok: false, error: 'token' });
  return out_({ ok: true, folder: folder_(e.parameter.root || 'سجلات تأخر الطالبات', '').getUrl() });
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.token !== TOKEN) return out_({ ok: false, error: 'token' });
    const folder = folder_(d.root || 'سجلات تأخر الطالبات', d.folder || '');
    const old = folder.getFilesByName(d.name);
    while (old.hasNext()) old.next().setTrashed(true);
    const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(d.data), d.mime, d.name));
    return out_({ ok: true, url: file.getUrl() });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  }
}

function folder_(rootName, path) {
  let it = DriveApp.getFoldersByName(rootName);
  let f = it.hasNext() ? it.next() : DriveApp.createFolder(rootName);
  path.split('/').filter(String).forEach(function (name) {
    const s = f.getFoldersByName(name);
    f = s.hasNext() ? s.next() : f.createFolder(name);
  });
  return f;
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

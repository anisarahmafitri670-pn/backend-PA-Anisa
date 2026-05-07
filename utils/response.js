function ok(res, message = 'OK', data = null) {
  return res.status(200).json({ success: true, message, data });
}

function created(res, message = 'Created', data = null) {
  return res.status(201).json({ success: true, message, data });
}

function badRequest(res, message = 'Validasi gagal', errors = []) {
  const payload = { success: false, message };
  if (errors && Array.isArray(errors) && errors.length > 0) payload.errors = errors;
  return res.status(400).json(payload);
}

function unauthorized(res, message = 'Unauthorized') {
  return res.status(401).json({ success: false, message });
}

function notFound(res, message = 'Data tidak ditemukan') {
  return res.status(404).json({ success: false, message });
}

function serverError(res, message = 'Terjadi kesalahan pada server') {
  return res.status(500).json({ success: false, message });
}

module.exports = { ok, created, badRequest, unauthorized, notFound, serverError };


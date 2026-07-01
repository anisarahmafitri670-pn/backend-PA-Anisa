const SAFE_NAME_PATTERN = /^[A-Za-zÀ-ÿ\s.,'-]+$/u;

function validateNameField(errors, fieldName, value) {
  const text = String(value || '').trim();

  if (!text) {
    errors.push(`${fieldName} tidak boleh kosong`);
    return;
  }

  if (!SAFE_NAME_PATTERN.test(text)) {
    errors.push(`${fieldName} mengandung karakter yang tidak diperbolehkan`);
  }
}

module.exports = {
  validateNameField
};

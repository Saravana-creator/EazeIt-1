const GOOGLE_DRIVE_PATTERN = /drive\.google\.com\//i;

export const isGoogleDriveUrl = (value) => {
  if (!value) return false;
  return GOOGLE_DRIVE_PATTERN.test(String(value).trim());
};

export const resolveProductImage = (src) => {
  if (!src) return '';
  const trimmed = String(src).trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:')) return trimmed;
  if (isGoogleDriveUrl(trimmed)) return '';
  return trimmed;
};

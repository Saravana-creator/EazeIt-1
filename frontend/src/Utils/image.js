export const normalizeGoogleDriveUrl = (value) => {
  if (!value) return '';
  const trimmed = value.trim();
  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  const driveOpenMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const driveOpenPathMatch = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  const driveUcmatch = trimmed.match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
  const fileId = driveFileMatch?.[1] || driveOpenMatch?.[1] || driveOpenPathMatch?.[1] || driveUcmatch?.[1];
  if (!fileId) return '';
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
};

export const resolveProductImage = (src) => {
  if (!src) return '';
  const trimmed = src.trim();
  if (trimmed.startsWith('data:')) return trimmed;
  return normalizeGoogleDriveUrl(trimmed) || trimmed;
};

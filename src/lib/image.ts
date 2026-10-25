// Shrinks an uploaded portrait to a small JPEG data URL so it can be stored locally
export const fileToAvatar = async (file: File, size = 320): Promise<string> => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, size / Math.min(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
};

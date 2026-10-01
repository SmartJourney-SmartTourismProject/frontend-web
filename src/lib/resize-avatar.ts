/** Downscale a picked image to a square JPEG data URL (centre-cropped) so it stays small enough to store inline. */
export async function resizeAvatar(file: File, size = 192): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Please choose a JPG, PNG or WebP image.');
  if (file.size > 8 * 1024 * 1024) throw new Error('That image is too large (max 8 MB).');

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not read that image.'));
      el.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not process that image.');
    ctx.fillStyle = '#ffffff'; // PNG transparency becomes white in a JPEG
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(
      img,
      (img.naturalWidth - side) / 2,
      (img.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      size,
      size,
    );
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

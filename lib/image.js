// Client-side image downscale + compress. Keeps uploads small so they're fast
// and (in dev, without Cloudinary) can be stored inline as a data URL.
export async function compressImage(file, maxDim = 1280, quality = 0.8) {
  if (!file || !file.type?.startsWith('image/')) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h)

    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality))
    if (!blob) return file
    return new File([blob], (file.name || 'photo').replace(/\.\w+$/, '') + '.jpg', {
      type: 'image/jpeg',
    })
  } catch {
    return file // fall back to the original if the browser can't decode it
  }
}

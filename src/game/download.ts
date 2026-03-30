export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Скачать файл с сервера как есть (те же байты, что в `public/`). */
export async function downloadOriginalAsset(
  publicPath: string,
  filename: string,
): Promise<void> {
  const res = await fetch(publicPath)
  if (!res.ok) return
  const blob = await res.blob()
  downloadBlob(blob, filename)
}

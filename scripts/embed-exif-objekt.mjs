/**
 * Вшивает реальные EXIF в public/objekt_5_13.jpg (видны в Finder, Windows «Свойства», exiftool и т.д.).
 * Запуск: npm run embed:exif
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import piexif from 'piexifjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const target = path.join(__dirname, '..', 'public', 'objekt_5_13.jpg')

if (!fs.existsSync(target)) {
  console.error('Нет файла:', target)
  process.exit(1)
}

const bin = fs.readFileSync(target).toString('latin1')
let exifObj
try {
  exifObj = piexif.load(bin)
} catch {
  exifObj = {
    '0th': {},
    Exif: {},
    GPS: {},
    Interop: {},
    '1st': {},
    thumbnail: null,
  }
}

/** В Exif IFD (UserComment) и дубль здесь: Preview / Finder на macOS часто не показывают UserComment, зато видно ImageDescription. */
const ACCESS_NOTE = 'ACCESS=obj513'

exifObj['0th'][piexif.ImageIFD.ImageDescription] = ACCESS_NOTE
exifObj['0th'][piexif.ImageIFD.Make] = 'RICOH IMAGING'
exifObj['0th'][piexif.ImageIFD.Model] = 'GR IIIx'
exifObj['0th'][piexif.ImageIFD.Software] = 'v1.01'
exifObj['0th'][piexif.ImageIFD.Copyright] =
  'internal use only - do not publish'
exifObj['0th'][piexif.ImageIFD.DateTime] = '2019:03:13 01:13:47'

exifObj.Exif[piexif.ExifIFD.DateTimeOriginal] = '2019:03:13 01:13:47'
exifObj.Exif[piexif.ExifIFD.ExposureTime] = [1, 250]
exifObj.Exif[piexif.ExifIFD.FNumber] = [14, 5]
exifObj.Exif[piexif.ExifIFD.FocalLength] = [261, 10]
exifObj.Exif[piexif.ExifIFD.LensModel] = 'GR LENS 26.1mm F2.8'
exifObj.Exif[piexif.ExifIFD.UserComment] = `ASCII\0\0\0${ACCESS_NOTE}`
exifObj.Exif[piexif.ExifIFD.ImageUniqueID] = '7A4F-13-OBJ-CASEFILE'

const exifBytes = piexif.dump(exifObj)
const newBin = piexif.insert(exifBytes, bin)
fs.writeFileSync(target, Buffer.from(newBin, 'latin1'))
console.log('EXIF записан в', target)

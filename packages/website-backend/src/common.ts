import { File as UploadedFile } from 'formidable'
import yazul, { Entry } from 'yauzl'
import { CreateProjectData, PageData } from './interfaces'

export function randomString(len = 5) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + len)
}

export function remove<T>(array: T[], item: T) {
  const index = array.indexOf(item)
  array.splice(index, 1)
}

export function getProjectDataFromZip(uploadedFile: UploadedFile) {
  return new Promise<{ data: CreateProjectData; warnings: string[] }>((resolve, reject) => {
    let shouldWarnInvalidFile = false
    const warnings: string[] = []
    const data: CreateProjectData = {
      name: uploadedFile.name.replace(/\.zip$/, ''),
      description: '', // TODO store description in a file inside the zip
      pages: [],
    }

    const pageDataByName = new Map<string, PageData>()
    const ensurePage = (pageName: string) => {
      if (!pageDataByName.has(pageName)) {
        const newPage: PageData = { name: pageName, selector: '', html: '' }
        data.pages.push(newPage)
        pageDataByName.set(pageName, newPage)
      }
      return pageDataByName.get(pageName)
    }

    yazul.open(uploadedFile.path, { lazyEntries: true }, (err, zip) => {
      if (err) {
        reject(err)
        return
      }
      zip.readEntry()
      zip.on('entry', (entry: Entry) => {
        if (/\/$/.test(entry.fileName)) {
          // Directory file names end with '/'.
          // Note that entires for directories themselves are optional.
          // An entry's fileName implicitly requires its parent directories to exist.
          zip.readEntry()
        } else {
          // file entry
          const isHtmlFile = entry.fileName.endsWith('.html')
          const isTemmeFile = entry.fileName.endsWith('.temme')
          if (!isHtmlFile && !isTemmeFile) {
            shouldWarnInvalidFile = true
            warnings.push(`Encounter an invalid file ${entry.fileName} in zip file.`)
            zip.readEntry()
            return // skip this entry
          }

          zip.openReadStream(entry, (err, readStream) => {
            if (err) {
              reject(err)
              return
            }

            const chunks: string[] = []
            readStream.setEncoding('utf8')
            readStream.on('data', (chuck: string) => {
              chunks.push(chuck)
            })
            readStream.on('end', () => {
              const content = chunks.join('')
              // 如果文件中包含 文件夹，则将文件名中的分隔符 '/' 替换为 '--'
              const pageName = entry.fileName.replace(/\//g, '--').replace(/\.(html|temme)$/, '')
              const page = ensurePage(pageName)
              if (isHtmlFile) {
                page.html = content
              }
              if (isTemmeFile) {
                page.selector = content
              }
              zip.readEntry()
            })
          })
        }
      })

      zip.on('end', () => {
        const maxWarningCount = 5
        if (warnings.length > maxWarningCount) {
          const extraWarningCount = warnings.length - maxWarningCount
          warnings.length = maxWarningCount
          warnings.push(`and ${extraWarningCount} more ...`)
        }
        if (shouldWarnInvalidFile) {
          warnings.push('\nNote that only html/temme files are valid, other files will be skipped.')
        }
        resolve({ data, warnings })
      })
    })
  })
}

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
      description: '',
      pages: [],
    }
    let meta: { name: string; description: string; pages: string[] } = null

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
          if (entry.fileName === 'meta.json') {
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
                meta = JSON.parse(content) // TODO 需要验证 content 是否正确
                zip.readEntry()
              })
            })
            return
          }

          const isHtmlFile = entry.fileName.endsWith('.html')
          const isTemmeFile = entry.fileName.endsWith('.temme')
          if (!isHtmlFile && !isTemmeFile) {
            shouldWarnInvalidFile = true
            warnings.push(`已跳过无法识别支持的文件 ${entry.fileName}`)
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

      function truncateWarnings() {
        const maxWarningCount = 5
        if (warnings.length > maxWarningCount) {
          const extraWarningCount = warnings.length - maxWarningCount
          warnings.length = maxWarningCount
          warnings.push(`以及 ${extraWarningCount} 条其他信息...`)
        }
        if (shouldWarnInvalidFile) {
          warnings.push(
            '注意：压缩文件应仅包含 .html/.temme 数据文件以及 meta.json 文件。其他文件将被跳过。',
          )
        }
      }

      zip.on('end', () => {
        truncateWarnings()

        if (meta == null) {
          warnings.push(
            '注意：压缩文件没有包含 meta.json 文件，工程的描述信息将被置为空，页面将按照字典序进行排序。',
          )
        } else {
          data.name = meta.name
          data.description = meta.description
          data.pages = []
          for (const pageName of meta.pages) {
            if (!pageDataByName.has(pageName)) {
              warnings.push(`压缩文件中缺少 ${pageName} 页面的数据。`)
            } else {
              data.pages.push(pageDataByName.get(pageName))
            }
          }
        }

        resolve({ data, warnings })
      })
    })
  })
}

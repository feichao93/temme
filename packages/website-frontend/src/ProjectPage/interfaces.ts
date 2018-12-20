export interface ProjectRecord {
  projectId: number
  userId: number
  name: string
  description: string
  pages: PageRecord[]
  createdAt: string
  updatedAt: string
}

export interface PageRecord {
  pageId: number
  projectId: number
  name: string
  description: string
  html: string
  createdAt: string
  updatedAt: string
  selectors: Array<{
    name: string
    content: string
    createAt: string
    updatedAt: string
  }>
}

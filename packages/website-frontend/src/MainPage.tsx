import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import './MainPage.styl'
import ProjectDescription from './ProjectDescription'
import { Project } from './types'
import { fromNow } from './utils/common'
import * as server from './utils/server'

export default function MainPage() {
  const [projects, setProjects] = useState<Project[]>(null)
  useEffect(() => {
    server.getRecommendedProjects().then(projects => {
      setProjects(projects)
    })
  }, [])

  return (
    <div className="main-page">
      <Header />
      <main>
        <div className="intro-text">
          <h1>创建、运行、分享 temme 选择器</h1>
          <p>temme 是一个类 jQuery 的选择器，用于简洁优雅地从 HTML 文档中提取 JSON 数据。</p>
        </div>

        {projects && (
          <div className="recommendations">
            <h1>推荐项目列表</h1>
            <div className="project-list">
              {projects.map(project => (
                <div key={project._id} className="project-item">
                  <span>
                    <Link className="project-name" to={`/@${project.username}/${project.name}`}>
                      @{project.username}/{project.name}
                    </Link>
                  </span>
                  <ProjectDescription project={project} />
                  <div className="project-update">{fromNow(project.updatedAt)}前更新</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <footer>
        Code with ❤️ by{' '}
        <a href="https://github.com/shinima" target="_blank">
          @shinima
        </a>
      </footer>
    </div>
  )
}

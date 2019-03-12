import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Project } from './types'
import './ProjectDescription.styl'

export default function ProjectDescription({
  project,
  noMargin,
}: {
  project: Project
  noMargin?: boolean
}) {
  return (
    <div className="project-description" style={{ margin: noMargin ? 0 : undefined }}>
      <ReactMarkdown className="markdown-wrapper" source={project.description} />
    </div>
  )
}

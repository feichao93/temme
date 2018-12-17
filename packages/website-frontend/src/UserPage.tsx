import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from './utils/session'
import { Project, UserInfo } from './types'
import Header from './Header'
import { deleteProject, getDetailInfo, getUserProjects } from './utils/server'
import { DeleteIcon, EditIcon, GithubIcon } from './icons'
import ProjectDialog from './Dialog/ProjectDialog'
import './UserPage.styl'

export default function UserPage() {
  return (
    <>
      <Header />
      <div className="user-page">
        <UserProfile />
        <UserProjects />
      </div>
    </>
  )
}

function UserProfile() {
  const { username } = useSession()
  const [userInfoState, setUserInfoState] = useState(null as UserInfo)
  const fetchUserInfo = async (username: string) => {
    try {
      const userInfo = await getDetailInfo(username)
      setUserInfoState({ ...userInfoState, ...userInfo })
    } catch (e) {
      console.error(e)
    }
  }
  useEffect(
    () => {
      if (username) {
        fetchUserInfo(username)
      }
    },
    [username],
  )
  return (
    userInfoState && (
      <div className="user-profile">
        <img src={userInfoState.avatar_url} alt="avatar-icon" />
        <div className="fullname">{userInfoState.name}</div>
        <div className="username">{username}</div>
        <div className="bio">{userInfoState.bio}</div>
        <a className="email" href={`mailto:${userInfoState.email}`}>
          {userInfoState.email}
        </a>
        <div className="location">{userInfoState.location}</div>
        <div className="divider" />
        <Link to={userInfoState.html_url} target="_blank">
          <GithubIcon size={30} />
        </Link>
      </div>
    )
  )
}

function UserProjects() {
  const { username } = useSession()
  const [projectsState, setProjectsState] = useState([] as Project[])
  const [selectedProjectState, setSelectedProjectState] = useState({
    name: '',
    projectId: -1,
    description: '',
  })
  const [show, setShow] = useState(false)
  const onOpen = () => setShow(true)
  const onClose = () => setShow(false)

  const fetchUserProjects = async (username: string) => {
    try {
      const projects = await getUserProjects(username)
      setProjectsState([...projects])
    } catch (e) {
      console.error(e)
    }
  }
  useEffect(
    () => {
      if (username) {
        fetchUserProjects(username)
      }
    },
    [username],
  )

  const createProject = () => {
    setSelectedProjectState({ name: '', projectId: -1, description: '' })
    onOpen()
  }

  const handleDeleteProject = async (projectId: number, name: string) => {
    if (confirm(`是否删除项目${name}`)) {
      try {
        await deleteProject(projectId)
        alert('删除成功')
        fetchUserProjects(username)
      } catch (e) {
        alert('删除失败，请稍后再试')
      }
    }
  }

  const handleEditProject = (project: Project) => {
    const { name, description, projectId } = project
    setSelectedProjectState({ name, description, projectId })
    onOpen()
  }

  const updateTime = (lastUpdate: string) => {
    const diffTime = (new Date().valueOf() - new Date(lastUpdate).valueOf()) / 1000
    if (diffTime > 3600 * 24) {
      return `${Math.floor(diffTime / 3600 / 24)}天`
    } else if (diffTime > 3600) {
      return `${Math.floor(diffTime / 3600)}小时`
    } else if (diffTime > 60) {
      return `${Math.floor(diffTime / 60)}分钟`
    } else {
      return '几秒'
    }
  }

  return (
    <div className="user-project">
      <div className="tab-bar">
        <div className="tab">
          Project
          <span className="count">{projectsState.length}</span>
        </div>
        <button onClick={createProject} className="create-project-button align-right">
          New Project
        </button>
      </div>
      <div className="project-list">
        {projectsState &&
          projectsState.map((project, index) => (
            <div className="project-item" key={`project-${index}`}>
              <Link className="project-name" to={`/@${username}/${project.name}`}>
                {project.name}
              </Link>
              <div className="project-description">{project.description}</div>
              <div className="project-update">{updateTime(project.updatedAt)}前更新</div>
              <div className="manage-project">
                <span onClick={() => handleEditProject(project)}>
                  <EditIcon />
                </span>
                <span onClick={() => handleDeleteProject(project.projectId, project.name)}>
                  <DeleteIcon />
                </span>
              </div>
            </div>
          ))}
      </div>
      <ProjectDialog
        key={selectedProjectState.projectId}
        show={show}
        onClose={onClose}
        {...{ ...selectedProjectState, username, fetchUserProjects }}
      />
    </div>
  )
}

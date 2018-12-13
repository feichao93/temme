import React, { useEffect, useState } from 'react'
import './UserPage.styl'
import { useSession } from './utils/session'
import { Project, UserInfo } from './types'
import { getDetailInfo, getUserProjects } from './utils/server'
import { GithubIcon } from './icons'

export default function UserPage(props: any) {
  return (
    <div className="user-page">
      <UserProfile />
      <UserProjects />
    </div>
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
        <a href={userInfoState.html_url} target="_blank">
          <GithubIcon size={30} />
        </a>
      </div>
    )
  )
}

function UserProjects() {
  const { username } = useSession()
  const [projectsState, setProjectsState] = useState([] as Project[])
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
  const dayUpdated = (lastUpdate: string) =>
    Math.floor((new Date().valueOf() - new Date(lastUpdate).valueOf()) / (1000 * 3600 * 24))
  return (
    <div className="user-project">
      <div className="tab-bar">
        <div className="tab">
          Project
          <span className="count">{projectsState.length}</span>
        </div>
      </div>
      <div className="project-list">
        {projectsState &&
          projectsState.map(project => (
            <div className="project-item" key={project.projectId}>
              <a className="project-name" href={`/@${username}/${project.name}`}>
                {project.name}
              </a>
              <div className="project-description">{project.description}</div>
              <div className="project-update">{dayUpdated(project.updatedAt)}天前更新</div>
            </div>
          ))}
      </div>
    </div>
  )
}

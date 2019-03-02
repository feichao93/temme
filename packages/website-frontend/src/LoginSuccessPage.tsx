import React, { useEffect } from 'react'
import { RouteComponentProps } from 'react-router'
import * as querystring from 'querystring'

export default function LoginSuccessPage(props: RouteComponentProps) {
  useEffect(() => {
    const search = props.location.search
    const { userId, username, isAdmin } = querystring.parse(search.substring(1))
    window.opener.postMessage({
      userId: Number(userId),
      username,
      isAdmin: isAdmin != null,
    })
    window.close()
  })
  return <div>成功登录</div>
}

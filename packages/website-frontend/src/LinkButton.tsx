import { DISPLAYNAME_PREFIX, removeNonHTMLProps } from '@blueprintjs/core'
import { AbstractButton } from '@blueprintjs/core/lib/esm/components/button/abstractButton'
import React from 'react'
import { Link } from 'react-router-dom'

export default class LinkButton extends AbstractButton<
  React.AnchorHTMLAttributes<HTMLAnchorElement>
> {
  public static displayName = `${DISPLAYNAME_PREFIX}.LinkButton`

  public render() {
    const { href, tabIndex = 0 } = this.props
    const commonProps = this.getCommonButtonProps()

    return (
      // @ts-ignore
      <Link
        role="button"
        {...removeNonHTMLProps(this.props)}
        {...commonProps}
        to={commonProps.disabled ? undefined : href}
        tabIndex={commonProps.disabled ? -1 : tabIndex}
      >
        {this.renderChildren()}
      </Link>
    )
  }
}

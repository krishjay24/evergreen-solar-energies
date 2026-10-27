import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { Link, type LinkProps } from 'react-router'

interface ActionBaseProps {
  className?: string
  children?: ReactNode
}

type ActionLinkProps = ActionBaseProps &
  Omit<LinkProps, 'className' | 'children'> & { href?: never; ref?: Ref<HTMLAnchorElement> }
type ActionAnchorProps = ActionBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & { href: string; to?: never; ref?: Ref<HTMLAnchorElement> }
type ActionButtonProps = ActionBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { to?: never; href?: never; ref?: Ref<HTMLButtonElement> }

/** Renders a router Link (`to`), an anchor (`href`) or a button, sharing one visual API. */
export type ActionProps = ActionLinkProps | ActionAnchorProps | ActionButtonProps

export type ActionPropsWithout<K extends PropertyKey> = ActionProps extends infer P ? (P extends unknown ? Omit<P, K> : never) : never

const isLink = (props: ActionProps): props is ActionLinkProps => props.to !== undefined
const isAnchor = (props: ActionProps): props is ActionAnchorProps => props.href !== undefined

export function Action(props: ActionProps) {
  if (isLink(props)) return <Link {...props} />
  if (isAnchor(props)) {
    const external = /^https?:\/\//.test(props.href)
    return <a {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...props} />
  }
  return <button type="button" {...props} />
}

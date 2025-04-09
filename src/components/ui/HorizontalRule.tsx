import classNames from 'classnames'
import React, { FC } from 'react'

type HorizontalRuleProp = {
    className?: string
}

const HorizontalRule: FC<HorizontalRuleProp> = ({className, ...props }) => {
  return (
    <hr {...props} className={classNames(
        'border-t border- w-full',
        `${className}`
    )} />
  )
}

export default HorizontalRule

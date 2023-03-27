import React, {Children, useEffect, useRef, useState} from 'react'
import Box from './Box'
import sx, {SxProp} from './sx'
import {useId} from './hooks/useId'
import {isFocusable} from '@primer/behaviors/utils'
import {invariant} from './utils/invariant'
import styled from 'styled-components'
import {get} from './constants'
import VisuallyHidden from './_VisuallyHidden'

export type Tooltip2Props = {
  direction?: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'
  text?: string
  noDelay?: boolean
  align?: 'left' | 'right'
  wrap?: boolean
  type?: 'label' | 'description'
  'aria-label'?: React.AriaAttributes['aria-label']
} & SxProp

export type TriggerPropsType = {
  'aria-describedby'?: string
  'aria-labelledby'?: string
  'aria-label'?: string
}

const Tooltip = styled.div<Tooltip2Props>`
  // tooltip element itself
  position: absolute;
  z-index: 1000000;
  padding: 0.5em 0.75em;
  font: normal normal 11px/1.5 ${get('fonts.normal')};
  -webkit-font-smoothing: subpixel-antialiased;
  color: ${get('colors.fg.onEmphasis')};
  text-align: center;
  text-decoration: none;
  text-shadow: none;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: break-word;
  white-space: normal;
  background: ${get('colors.neutral.emphasisPlus')};
  border-radius: ${get('radii.1')};
  width: max-content;
  opacity: 0;

  // the caret
  &::before {
    position: absolute;
    z-index: 1000001;
    color: ${get('colors.neutral.emphasisPlus')};
    content: '';
    border: 6px solid transparent;
    opacity: 0;
  }

  // This is needed to keep the tooltip open when the user leaves the trigger element to hover tooltip
  &::after {
    position: absolute;
    display: block;
    right: 0;
    left: 0;
    height: 8px;
    content: '';
  }

  // delay animation for tooltip
  @keyframes tooltip-appear {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  &[data-state='open'],
  &[data-state='open']::before {
    animation-name: tooltip-appear;
    animation-duration: 0.1s;
    animation-fill-mode: forwards;
    animation-timing-function: ease-in;
    animation-delay: 0.4s;
  }

  &[data-direction='n']:before,
  &[data-direction='s']:before {
    right: 50%;
    margin-right: -6px;
  }

  &[data-direction='s']::before,
  &[data-direction='se']::before,
  &[data-direction='sw']::before {
    bottom: 100%;
    border-bottom-color: ${get('colors.neutral.emphasisPlus')};
  }

  &[data-direction='s']::after,
  &[data-direction='se']::after,
  &[data-direction='sw']::after {
    bottom: 100%;
  }

  &[data-direction='n']::before,
  &[data-direction='ne']::before,
  &[data-direction='nw']::before {
    top: 100%;
    border-top-color: ${get('colors.neutral.emphasisPlus')};
  }

  &[data-direction='n']::after,
  &[data-direction='ne']::after,
  &[data-direction='nw']::after {
    top: 100%;
  }

  &[data-direction='se']::before,
  &[data-direction='ne']::before {
    left: 0;
    margin-left: 6px;
  }

  &[data-direction='sw']::before,
  &[data-direction='nw']::before {
    right: 0;
    margin-right: 6px;
  }

  &[data-direction='w']::before {
    top: 50%;
    bottom: 50%;
    left: 100%;
    margin-top: -6px;
    border-left-color: ${get('colors.neutral.emphasisPlus')};
  }

  &[data-direction='e']::before {
    top: 50%;
    bottom: 50%;
    right: 100%;
    margin-top: -6px;
    border-right-color: ${get('colors.neutral.emphasisPlus')};
  }

  &[data-state='open'] {
    &[data-delay='true'],
    &[data-delay='true']::before {
      animation-delay: 0s;
    }
    &[data-direction='s'],
    &[data-direction='se'],
    &[data-direction='sw'] {
      top: 100%;
      right: 50%;
      margin-top: 6px;
    }

    &[data-direction='n'],
    &[data-direction='ne'],
    &[data-direction='nw'] {
      bottom: 100%;
      margin-bottom: 6px;
      right: 50%;
    }

    &[data-direction='n'],
    &[data-direction='s'] {
      transform: translateX(50%);
    }

    &[data-direction='se'] {
      right: auto;
      left: 50%;
      margin-left: -${get('space.3')};
    }
    &[data-direction='ne'] {
      right: auto;
      left: 50%;
      margin-left: -${get('space.3')};
    }

    &[data-direction='sw'] {
      margin-right: -${get('space.3')};
    }

    &[data-direction='e'] {
      bottom: 50%;
      left: 100%;
      margin-left: 6px;
      transform: translateY(50%);
    }

    &[data-direction='w'] {
      bottom: 50%;
      right: 100%;
      margin-right: 6px;
      transform: translateY(50%);
    }

    &[data-align='left'] {
      right: 100%;
      margin-left: 0;
    }
    &[data-align='left']::before {
      right: 40px;
    }
    &[data-align='right'] {
      right: 0;
      margin-right: 0;
    }
    &[data-align='right']::before {
      right: 72px;
    }

    &[data-wrap='true'] {
      display: table-cell;
      width: max-content;
      max-width: 250px;
      word-wrap: break-word;
      white-space: pre-line;
      border-collapse: separate;
    }

    &[data-wrap='true'][data-direction='n'],
    &[data-wrap='true'][data-direction='s'] {
      transform: translateX(-50%);
      right: auto;
      left: 50%;
    }

    &[data-wrap='true'][data-direction='w'],
    &[data-wrap='true'][data-direction='e'] {
      right: 100%;
    }
  }

  ${sx};
`

const Tooltip2: React.FC<React.PropsWithChildren<Tooltip2Props>> = ({
  direction = 'n',
  // used for description type
  text,
  // used for label type
  'aria-label': label,
  align,
  wrap,
  noDelay,
  type = 'label',
  children,
  ...rest
}) => {
  const id = useId()
  const tooltipRef = useRef<HTMLDivElement>(null)
  const child = Children.only(children) // make sure there is only one child
  const [open, setOpen] = useState(false)

  // we need this check for every render
  if (__DEV__) {
    // Practically, this is not a conditional hook, it is a compile time check
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (tooltipRef.current) {
        const childNode = tooltipRef.current.children[0] // For now, I assume it has one node but that is not true
        invariant(
          isFocusable(childNode as HTMLElement),
          'The `Tooltip2` component expects a single React element that contains interactive content. Consider using a `<button>` or equivalent interactive element instead.',
        )
      }
    })
  }

  const triggerEvtHandlers = {
    onFocus: () => setOpen(true),
    onBlur: () => {
      setOpen(false)
    },
    onMouseEnter: () => {
      setOpen(true)
    },
  }

  // Make sure to compose the default event handlers for tooltip trigger with the ones that are passed in
  function composeEventHandlers(child: React.ReactElement) {
    const {onBlur: _onBlur, onFocus: _onFocus, onMouseEnter: _onMouseEnter} = child.props

    return {
      onBlur: () => {
        _onBlur && _onBlur()
        triggerEvtHandlers.onBlur()
      },
      onFocus: () => {
        _onFocus && _onFocus()
        triggerEvtHandlers.onFocus()
      },
      onMouseEnter: () => {
        _onMouseEnter && _onMouseEnter()
        triggerEvtHandlers.onMouseEnter()
      },
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (open && e.key === 'Escape') {
      e.stopPropagation()
      setOpen(false)
    }
  }

  return (
    <Box
      ref={tooltipRef}
      sx={{position: 'relative', display: 'inline-block'}}
      onKeyDown={onKeyDown}
      onMouseLeave={() => {
        setOpen(false)
      }}
    >
      {React.cloneElement(child as React.ReactElement<TriggerPropsType>, {
        ...{
          // if it is a type description, we use tooltip to describe the trigger
          'aria-describedby': type === 'description' ? id : undefined,
          // If it is a type description, we should keep the aria label if it exists, otherwise we remove it because we will use aria-labelledby
          'aria-label': type === 'description' ? (children as React.ReactElement).props['aria-label'] : undefined,
          //   If it is a label type, we use tooltip to label the trigger
          'aria-labelledby': type === 'label' ? id : undefined,
        },
        ...composeEventHandlers(child as React.ReactElement<TriggerPropsType>),
      })}
      {/* Render the tooltip component visually hidden when it is not open*/}
      <VisuallyHidden isVisible={open}>
        <Tooltip
          data-direction={direction}
          data-state={open ? 'open' : undefined}
          data-align={align}
          data-wrap={wrap}
          data-delay={noDelay}
          {...rest}
          // Only need tooltip role if the tooltip is a description for supplementary information
          role={type === 'description' ? 'tooltip' : undefined}
          // stop AT from announcing the tooltip twice when it is a label type because it will be announced with "aria-labelledby"
          aria-hidden={type === 'label' ? true : undefined}
          id={id}
        >
          {text || label}
        </Tooltip>
      </VisuallyHidden>
    </Box>
  )
}

export default Tooltip2
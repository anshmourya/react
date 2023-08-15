import React, {forwardRef, MouseEventHandler} from 'react'
import Box from '../Box'
import {BetterSystemStyleObject, merge, SxProp} from '../sx'
import {defaultSxProp} from '../utils/defaultSxProp'
import TokenBase, {defaultTokenSize, isTokenInteractive, TokenBaseProps} from './TokenBase'
import RemoveTokenButton from './_RemoveTokenButton'
import TokenTextContainer from './_TokenTextContainer'
import {ForwardRefComponent as PolymorphicForwardRefComponent} from '../utils/polymorphic'
import VisuallyHidden from '../_VisuallyHidden'
import {getVariant} from './getVariant'
import {getColorsFromHex} from './getColorsFromHex'
import {useTheme} from '../ThemeProvider'

export type Variant = 'purple' | 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'gray'

// Omitting onResize and onResizeCapture because seems like React 18 types includes these menthod in the expansion but React 17 doesn't.
// TODO: This is a temporary solution until we figure out why these methods are causing type errors.
export interface TokenProps extends TokenBaseProps, SxProp {
  /** A function that renders a component before the token text */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  leadingVisual?: React.ComponentType<React.PropsWithChildren<any>>
  /** hex string that changes the color of a token, only for backwards compatibility */
  deprecatedFillColor?: string
  /** the name of a variant that changed the color fo the token */
  variant?: Variant
}

const tokenBorderWidthPx = 1

const LeadingVisualContainer: React.FC<React.PropsWithChildren<Pick<TokenBaseProps, 'size'>>> = ({children, size}) => (
  <Box
    sx={{
      flexShrink: 0,
      lineHeight: 0,
      marginRight: size && ['large', 'extralarge', 'xlarge'].includes(size) ? 2 : 1,
    }}
  >
    {children}
  </Box>
)

const Token = forwardRef((props, forwardedRef) => {
  const {
    as,
    variant,
    deprecatedFillColor,
    onRemove,
    id,
    leadingVisual: LeadingVisual,
    text,
    size = defaultTokenSize,
    hideRemoveButton,
    href,
    onClick,
    sx: sxProp = defaultSxProp,
    ...rest
  } = props
  const hasMultipleActionTargets = isTokenInteractive(props) && Boolean(onRemove) && !hideRemoveButton
  const {resolvedColorScheme: colorScheme} = useTheme()
  const onRemoveClick: MouseEventHandler = e => {
    e.stopPropagation()
    onRemove && onRemove()
  }
  const interactiveTokenProps = {
    as,
    href,
    onClick,
  }

  const sx = merge<BetterSystemStyleObject>(
    {
      backgroundColor: 'neutral.subtle',
      borderColor: props.isSelected ? 'fg.default' : 'border.subtle',
      color: props.isSelected ? 'fg.default' : 'fg.muted',
      borderWidth: `${tokenBorderWidthPx}px`,
      borderStyle: 'solid',
      maxWidth: '100%',
      paddingRight: !(hideRemoveButton || !onRemove) ? 0 : undefined,
      ...(isTokenInteractive(props)
        ? {
            '&:hover': {
              backgroundColor: 'neutral.muted',
              color: 'fg.default',
              boxShadow: 'shadow.medium',
            },
          }
        : {}),
      ...(variant ? getVariant(variant, props.isSelected) : {}),
      ...(deprecatedFillColor ? getColorsFromHex(deprecatedFillColor, colorScheme, props.isSelected) : {}),
    },
    sxProp,
  )

  return (
    <TokenBase
      onRemove={onRemove}
      id={id?.toString()}
      text={text}
      size={size}
      sx={sx}
      {...(!hasMultipleActionTargets ? interactiveTokenProps : {})}
      {...rest}
      ref={forwardedRef}
    >
      {LeadingVisual ? (
        <LeadingVisualContainer size={size}>
          <LeadingVisual />
        </LeadingVisualContainer>
      ) : null}
      <TokenTextContainer {...(hasMultipleActionTargets ? interactiveTokenProps : {})}>{text}</TokenTextContainer>
      {onRemove && <VisuallyHidden> (press backspace or delete to remove)</VisuallyHidden>}
      {!hideRemoveButton && onRemove ? (
        <RemoveTokenButton
          borderOffset={tokenBorderWidthPx}
          onClick={onRemoveClick}
          size={size}
          isParentInteractive={isTokenInteractive(props)}
          aria-hidden={hasMultipleActionTargets ? 'true' : 'false'}
        />
      ) : null}
    </TokenBase>
  )
}) as PolymorphicForwardRefComponent<'a' | 'button' | 'span', TokenProps>

Token.displayName = 'Token'

export default Token

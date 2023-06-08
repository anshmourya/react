import React, {forwardRef, MouseEventHandler, useMemo} from 'react'
import {CSSObject} from '@styled-system/css'
import TokenBase, {defaultTokenSize, isTokenInteractive, TokenBaseProps} from './TokenBase'
import RemoveTokenButton from './_RemoveTokenButton'
import {Hsluv} from 'hsluv'
import {useTheme} from '../ThemeProvider'
import TokenTextContainer from './_TokenTextContainer'
import {ForwardRefComponent as PolymorphicForwardRefComponent} from '../utils/polymorphic'
import {getContrast} from 'color2k'
import '../../.storybook/primitives-v8.css'
export type NewTokenVariants = 'purple' | 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'gray'

export interface NewTokenProps extends TokenBaseProps {
  variant?: NewTokenVariants
  fillColor?: hexString
}
export type hexString = `#${string}`
type colorSchemes =
  | 'light'
  | 'light_high_contrast'
  | 'light_colorblind'
  | 'light_tritanopia'
  | 'dark'
  | 'dark_dimmed'
  | 'dark_high_contrast'
  | 'dark_colorblind'
  | 'dark_tritanopia'
type variantColor = {
  backgroundColor: string
  textColor: string
  borderColor?: string
  backgroundColorHover?: string
}
type variant = {
  light: variantColor
  light_high_contrast?: variantColor
  dark_high_contrast?: variantColor
  dark: variantColor
  dark_dimmed?: variantColor
}

const hexRegEx = /^#?(?:(?:[\da-f]{3}){1,2}|(?:[\da-f]{4}){1,2})$/i
const isHex = (hex: string | hexString): hex is hexString => hexRegEx.test(hex)

const hexToHsluv = (hex: string) => {
  const color = new Hsluv()
  color.hex = hex
  color.hexToHsluv()
  const {hsluv_h: h, hsluv_s: s, hsluv_l: l} = color
  return {h, s, l}
}

const hsluvToHex = ({h, s, l}: {h: number; s: number; l: number}): string => {
  const color = new Hsluv()
  // eslint-disable-next-line camelcase
  color.hsluv_h = h
  // eslint-disable-next-line camelcase
  color.hsluv_s = s
  // eslint-disable-next-line camelcase
  color.hsluv_l = l
  color.hsluvToHex()
  return color.hex
}

const variants: {
  [Property in NewTokenVariants]: variant
} = {
  blue: {
    light: {
      backgroundColor: '#E5F0FB',
      backgroundColorHover: '#DAE9F9',
      textColor: '#005CB6',
    },
    light_high_contrast: {
      backgroundColor: '#E5F0FB',
      textColor: '#004E9C',
      borderColor: '#4D99E4',
    },
    dark: {
      backgroundColor: '#13273D',
      textColor: '#4594E3',
    },
    dark_high_contrast: {
      backgroundColor: '#13273D',
      textColor: '#80B6EC',
      borderColor: '#0265C7',
    },
    dark_dimmed: {
      backgroundColor: '#1E3247',
      textColor: '#4594E3',
    },
  },
  purple: {
    light: {
      backgroundColor: '#F0E5FB',
      textColor: '#6200C3',
    },
    dark: {
      backgroundColor: '#311E4F',
      textColor: '#AE73EA',
    },
  },
  green: {
    light: {
      backgroundColor: '#E5F7EB',
      textColor: '#00802B',
    },
    dark: {
      backgroundColor: '#133226',
      textColor: '#00B23B',
    },
  },
  yellow: {
    light: {
      backgroundColor: '#FFFCEE',
      textColor: '#8A7300',
    },
    dark: {
      backgroundColor: '#33352C',
      textColor: '#EAC404',
    },
  },
  orange: {
    light: {
      backgroundColor: '#FFF7F0',
      textColor: '#B15A01',
    },
    dark: {
      backgroundColor: '#392A1E',
      textColor: '#FD8104',
    },
  },
  red: {
    light: {
      backgroundColor: '#FBE5E6',
      textColor: '#D60000',
    },
    dark: {
      backgroundColor: '#3B1B20',
      textColor: '#E75E5E',
    },
  },
  gray: {
    light: {
      backgroundColor: '#ECEDEE',
      textColor: '#434A52',
    },
    dark: {
      backgroundColor: '#2C3139',
      textColor: '#A8B0B8',
    },
  },
} as const

const getColorScheme = (
  variant: NewTokenVariants,
  colorScheme: colorSchemes,
): Extract<colorSchemes, 'light' | 'dark'> => {
  if (variant in variants && colorScheme in variants[variant]) {
    return colorScheme as Extract<colorSchemes, 'light' | 'dark'>
  }
  if (colorScheme.startsWith('dark') && variants[variant].hasOwnProperty('dark')) {
    return 'dark'
  }
  return 'light'
}

const getColorsFromHex = (hex: string, colorScheme: colorSchemes): variantColor => {
  let bgLightness = 96
  let textLightnessIncrement = -1
  let ratio = 4.5
  if (colorScheme.startsWith('dark')) {
    bgLightness = 16
    textLightnessIncrement = 1
    ratio = 5.5
  }
  const {h, s} = hexToHsluv(hex)
  const backgroundColor = hsluvToHex({h, s, l: bgLightness})
  let textColor = hsluvToHex({h, s, l: 50})
  let textLightness = 50
  while (getContrast(textColor, backgroundColor) < ratio && textLightness > 0 && textLightness < 100) {
    textLightness += textLightnessIncrement
    textColor = hsluvToHex({h, s, l: textLightness})
  }
  // return
  return {
    backgroundColor,
    textColor,
  }
}

const variantColors = (variant: NewTokenVariants, colorScheme: colorSchemes): variantColor => ({
  backgroundColor: `var(--presentational-ui-${variant}-background)`,
  backgroundColorHover: `var(--presentational-ui-${variant}-backgroundHover)`,
  textColor: `var(--presentational-ui-${variant}-text)`,
  borderColor: colorScheme.endsWith('high_contrast') ? `var(--presentational-ui-${variant}-border)` : undefined,
})

const getLabelColors = (
  variant?: NewTokenVariants,
  fillColor?: hexString,
  resolvedColorScheme: colorSchemes = 'light',
): variantColor => {
  // valid variant
  if (variant) {
    return variantColors(variant, resolvedColorScheme as colorSchemes)
  }
  // valid hex string
  if (fillColor && isHex(fillColor)) {
    return getColorsFromHex(fillColor, resolvedColorScheme as colorSchemes)
  }
  // invalid variant and invalid hex string
  const fallbackVariant = Object.keys(variants)[0] as NewTokenVariants
  return variants[fallbackVariant][getColorScheme(fallbackVariant, resolvedColorScheme)]
}

const NewToken = forwardRef((props, forwardedRef) => {
  const {
    as,
    variant,
    fillColor,
    onRemove,
    id,
    isSelected,
    text,
    size = defaultTokenSize,
    hideRemoveButton,
    href,
    onClick,
    ...rest
  } = props

  const interactiveTokenProps = {
    as,
    href,
    onClick,
  }

  const {resolvedColorScheme} = useTheme()

  const hasMultipleActionTargets = isTokenInteractive(props) && Boolean(onRemove) && !hideRemoveButton
  const onRemoveClick: MouseEventHandler = e => {
    e.stopPropagation()
    onRemove && onRemove()
  }
  const labelStyles: CSSObject = useMemo(() => {
    const {backgroundColor, textColor, borderColor, backgroundColorHover} = getLabelColors(
      variant,
      fillColor,
      resolvedColorScheme as colorSchemes,
    )

    return {
      paddingRight: hideRemoveButton || !onRemove ? undefined : 0,
      position: 'relative',
      backgroundColor,
      color: textColor,
      border: `1px solid ${borderColor || backgroundColor}`,
      ...(isTokenInteractive(props)
        ? {
            '&:hover': {
              background: backgroundColorHover || backgroundColor,
              border: `1px solid ${borderColor || backgroundColorHover || backgroundColor}`,
            },
          }
        : {}),
    }
  }, [fillColor, variant, resolvedColorScheme, hideRemoveButton, onRemove, props])

  return (
    <TokenBase
      onRemove={onRemove}
      id={id?.toString()}
      isSelected={isSelected}
      text={text}
      size={size}
      sx={labelStyles}
      {...(!hasMultipleActionTargets ? interactiveTokenProps : {})}
      {...rest}
      ref={forwardedRef}
    >
      <TokenTextContainer {...(hasMultipleActionTargets ? interactiveTokenProps : {})}>{text}</TokenTextContainer>
      {!hideRemoveButton && onRemove ? (
        <RemoveTokenButton
          onClick={onRemoveClick}
          size={size}
          aria-hidden={hasMultipleActionTargets ? 'true' : 'false'}
          isParentInteractive={isTokenInteractive(props)}
          sx={
            hasMultipleActionTargets
              ? {
                  position: 'relative',
                  zIndex: '1',
                }
              : {}
          }
        />
      ) : null}
    </TokenBase>
  )
}) as PolymorphicForwardRefComponent<'span' | 'a' | 'button', NewTokenProps>

NewToken.displayName = 'NewToken'

export default NewToken

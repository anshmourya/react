import {ComponentType, FC, ReactElement, forwardRef, isValidElement} from 'react'
import {FormValidationStatus} from '../utils/types/FormValidationStatus'

/**
 * Presence of this symbol on a component indicates that it supports `FormControl``s auto-wiring features.
 * By not exporting this symbol we force consumers to use the HOC wrapper function, ensuring that the prop types align.
 */
const supportsAutoWiring = Symbol('FormControl.supportsAutoWiring')

/**
 * When a supported component is used as a child of `FormControl`, it will be cloned and these props will be
 * overidden to auto-wire accessibility features. These props should be forwarded to the underlying form control,
 * typically a Primer component.
 */
export interface FormControlForwardedProps {
  id?: string
  required?: boolean
  disabled?: boolean
  ['aria-describedby']?: string
  validationStatus?: FormValidationStatus
}

type AutoWirableComponent = FC<FormControlForwardedProps> & {
  [supportsAutoWiring]: unknown
}

type AutoWirableElement = ReactElement<FormControlForwardedProps, AutoWirableComponent>

/**
 * Mark a component to indicate that it supports `FormControl` autowiring by forwarding the props in
 * `FormControlAutowireComponentProps` to an underlying form element or component. This is useful when
 * wrapping/extending Primer form controls to make them easier to use.
 */
// use explicit return type to hide the `supportsAutoWiring` symbol from the public API
export function autoWirable<P extends FormControlForwardedProps>(component: ComponentType<P>): ComponentType<P> {
  return Object.assign(component, {[supportsAutoWiring]: true})
}

export function isValidAutoWirableElement(object: Parameters<typeof isValidElement>[0]): object is AutoWirableElement {
  return isValidElement(object) && Object.getOwnPropertySymbols(object.type).includes(supportsAutoWiring)
}

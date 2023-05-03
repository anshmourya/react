import React, {KeyboardEventHandler, useCallback, useEffect, useRef} from 'react'
import TextInput, {TextInputProps} from '../TextInput'
import Box from '../Box'
import {ActionList, ActionListProps, ActionListItemProps} from '../ActionList'
import Spinner from '../Spinner'
import {useFocusZone} from '../hooks/useFocusZone'
import {useProvidedStateOrCreate} from '../hooks/useProvidedStateOrCreate'
import styled from 'styled-components'
import {get} from '../constants'
import {useProvidedRefOrCreate} from '../hooks/useProvidedRefOrCreate'
import useScrollFlash from '../hooks/useScrollFlash'
import {scrollIntoView} from '@primer/behaviors'
import type {ScrollIntoViewOptions} from '@primer/behaviors'
import {SxProp} from '../sx'
import {useId} from '../hooks/useId'

const menuScrollMargins: ScrollIntoViewOptions = {startMargin: 0, endMargin: 8}

export type ItemInput = Partial<
  ActionListItemProps & {
    description?: string
    descriptionVariant?: string
    leadingVisual?: JSX.Element
    onAction?: (itemFromAction: ItemInput, event: React.MouseEvent) => void
    selected?: boolean
    text?: string
    trailingVisual?: string
  }
>

export interface FilteredActionListProps extends ActionListProps, SxProp {
  loading?: boolean
  placeholderText: string
  filterValue?: string
  onFilterChange: (value: string, e: React.ChangeEvent<HTMLInputElement>) => void
  textInputProps?: Partial<Omit<TextInputProps, 'onChange'>>
  inputRef?: React.RefObject<HTMLInputElement>
  items: ItemInput[]
  renderFn?: (props: ItemInput) => React.ReactElement
}

const StyledHeader = styled.div`
  box-shadow: 0 1px 0 ${get('colors.border.default')};
  z-index: 1;
`

export function FilteredActionList({
  loading = false,
  placeholderText,
  filterValue: externalFilterValue,
  onFilterChange,
  items,
  renderFn,
  textInputProps,
  inputRef: providedInputRef,
  sx,
  ...listProps
}: FilteredActionListProps): JSX.Element {
  const [filterValue, setInternalFilterValue] = useProvidedStateOrCreate(externalFilterValue, undefined, '')
  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      onFilterChange(value, e)
      setInternalFilterValue(value)
    },
    [onFilterChange, setInternalFilterValue],
  )

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const listContainerRef = useRef<HTMLUListElement>(null)
  const inputRef = useProvidedRefOrCreate<HTMLInputElement>(providedInputRef)
  const activeDescendantRef = useRef<HTMLElement>()
  const listId = useId()
  const onInputKeyPress: KeyboardEventHandler = useCallback(
    event => {
      if (event.key === 'Enter' && activeDescendantRef.current) {
        event.preventDefault()
        event.nativeEvent.stopImmediatePropagation()

        // Forward Enter key press to active descendant so that item gets activated
        const activeDescendantEvent = new KeyboardEvent(event.type, event.nativeEvent)
        activeDescendantRef.current.dispatchEvent(activeDescendantEvent)
      }
    },
    [activeDescendantRef],
  )

  useFocusZone(
    {
      containerRef: listContainerRef,
      focusOutBehavior: 'wrap',
      focusableElementFilter: element => {
        return !(element instanceof HTMLInputElement)
      },
      activeDescendantFocus: inputRef,
      onActiveDescendantChanged: (current, _previous, directlyActivated) => {
        activeDescendantRef.current = current

        if (current && scrollContainerRef.current && directlyActivated) {
          scrollIntoView(current, scrollContainerRef.current, menuScrollMargins)
        }
      },
    },
    [
      // List ref isn't set while loading.  Need to re-bind focus zone when it changes
      loading,
    ],
  )

  useEffect(() => {
    // if items changed, we want to instantly move active descendant into view
    if (activeDescendantRef.current && scrollContainerRef.current) {
      scrollIntoView(activeDescendantRef.current, scrollContainerRef.current, {...menuScrollMargins, behavior: 'auto'})
    }
  }, [items])

  useScrollFlash(scrollContainerRef)

  return (
    <Box display="flex" flexDirection="column" overflow="hidden" sx={sx}>
      <StyledHeader>
        <TextInput
          ref={inputRef}
          block
          width="auto"
          color="fg.default"
          value={filterValue}
          onChange={onInputChange}
          onKeyPress={onInputKeyPress}
          placeholder={placeholderText}
          aria-label={placeholderText}
          aria-controls={listId}
          {...textInputProps}
        />
      </StyledHeader>
      <Box ref={scrollContainerRef} overflow="auto">
        {loading ? (
          <Box width="100%" display="flex" flexDirection="row" justifyContent="center" pt={6} pb={7}>
            <Spinner />
          </Box>
        ) : (
          <ActionList
            ref={listContainerRef}
            {...listProps}
            role="listbox"
            id={listId}
            aria-label={`${placeholderText} options`}
          >
            {items.map(i => renderFn?.(i))}
          </ActionList>
        )}
      </Box>
    </Box>
  )
}

FilteredActionList.displayName = 'FilteredActionList'

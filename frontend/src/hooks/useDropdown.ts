import { useState, useRef, useEffect, useCallback, MouseEvent as ReactMouseEvent, KeyboardEvent as ReactKeyboardEvent } from "react"
import { DropdownOption, UseDropdownProps } from "@/types/components"

export function useDropdown({
  options,
  value,
  onChange,
  multiple = false,
  disabled = false,
  maxSelectionLimit,
}: UseDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)

  // Normalize value based on single/multiple mode
  const selectedValues = multiple
    ? Array.isArray(value)
      ? value
      : value
      ? [value]
      : []
    : typeof value === "string"
    ? value
    : ""

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    if (isOpen) {
      setSearch("")
      setFocusedIndex(-1)
      // Focus search input after the dropdown renders
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 0)
    }
  }, [isOpen])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [])

  const handleSelect = useCallback(
    (option: DropdownOption) => {
      if (multiple) {
        const currentValues = selectedValues as string[]
        const isSelected = currentValues.includes(option.value)

        let newValues: string[]
        if (isSelected) {
          newValues = currentValues.filter((v) => v !== option.value)
        } else {
          if (maxSelectionLimit && currentValues.length >= maxSelectionLimit) {
            return // Limit reached
          }
          newValues = [...currentValues, option.value]
        }
        onChange(newValues)
      } else {
        onChange(option.value)
        setIsOpen(false)
        setSearch("")
      }
    },
    [multiple, selectedValues, maxSelectionLimit, onChange]
  )

  const handleRemoveValue = (e: ReactMouseEvent, valToRemove: string) => {
    e.stopPropagation()
    if (disabled) return
    const currentValues = selectedValues as string[]
    onChange(currentValues.filter((v) => v !== valToRemove))
  }

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case "Enter":
        if (
          isOpen &&
          focusedIndex >= 0 &&
          focusedIndex < filteredOptions.length
        ) {
          e.preventDefault()
          handleSelect(filteredOptions[focusedIndex])
        } else if (!isOpen) {
          setIsOpen(true)
        }
        break
      case "ArrowDown":
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setFocusedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          )
        }
        break
      case "ArrowUp":
        e.preventDefault()
        if (isOpen) {
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        }
        break
      case "Escape":
        setIsOpen(false)
        break
      case "Backspace":
        if (
          multiple &&
          search === "" &&
          (selectedValues as string[]).length > 0
        ) {
          const currentValues = selectedValues as string[]
          onChange(currentValues.slice(0, -1))
        }
        break
    }
  }

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listboxRef.current) {
      const item = listboxRef.current.children[focusedIndex] as HTMLElement
      if (item) {
        item.scrollIntoView({ block: "nearest", behavior: "smooth" })
      }
    }
  }, [focusedIndex, isOpen])

  return {
    isOpen,
    setIsOpen,
    search,
    setSearch,
    focusedIndex,
    setFocusedIndex,
    containerRef,
    searchInputRef,
    listboxRef,
    selectedValues,
    filteredOptions,
    handleSelect,
    handleRemoveValue,
    handleKeyDown,
  }
}

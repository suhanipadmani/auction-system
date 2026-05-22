"use client"

import { CheckIcon, ChevronDownIcon, XIcon, SearchIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownProps } from "@/types/components"
import { useDropdown } from "@/hooks/useDropdown"

export function Dropdown({
  options,
  value,
  onChange,
  multiple = false,
  placeholder = "Select...",
  className,
  triggerClassName,
  triggerIcon,
  loading = false,
  disabled = false,
  maxSelectionLimit,
  label,
  required,
  showSearch = true,
}: DropdownProps) {
  const {
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
  } = useDropdown({
    options,
    value,
    onChange,
    multiple,
    disabled,
    maxSelectionLimit,
  })

  const renderSelectedValue = () => {
    if (multiple) {
      const values = selectedValues as string[]
      if (values.length === 0) {
        return <span className="text-muted-foreground">{placeholder}</span>
      }

      return (
        <div className="flex flex-wrap gap-1.5">
          {values.map((val) => {
            const option = options.find((o) => o.value === val)
            return (
              <span
                key={val}
                className="inline-flex items-center gap-1 rounded-md bg-secondary/80 px-2 py-0.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary"
              >
                {option?.label || val}
                <button
                  type="button"
                  onClick={(e) => handleRemoveValue(e, val)}
                  className="rounded-full p-0.5 outline-none transition-colors hover:bg-black/10 focus:ring-2 focus:ring-ring dark:hover:bg-white/10"
                >
                  <XIcon className="size-3" />
                  <span className="sr-only">Remove {option?.label || val}</span>
                </button>
              </span>
            )
          })}
        </div>
      )
    }

    const singleValue = selectedValues as string
    if (!singleValue) {
      return <span className="text-muted-foreground">{placeholder}</span>
    }

    const option = options.find((o) => o.value === singleValue)
    return <span className="truncate">{option?.label || singleValue}</span>
  }

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground/80 flex items-center gap-1">
          {label}
          {required && <span className="text-destructive font-bold">*</span>}
        </label>
      )}
      <div
        className="relative w-full"
        ref={containerRef}
        onKeyDown={handleKeyDown}
      >
        <div
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="dropdown-options"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-accent/10",
            isOpen && "ring-2 ring-ring ring-offset-2",
            triggerClassName
          )}
        >
          <div className={cn("flex flex-1 items-center gap-2 overflow-hidden", multiple ? "flex-wrap" : "flex-nowrap")}>
            {triggerIcon && <span className="shrink-0">{triggerIcon}</span>}
            {renderSelectedValue()}
          </div>

          <div className="ml-2 flex shrink-0 items-center gap-1 text-muted-foreground">
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ChevronDownIcon
                className={cn("size-4 transition-transform duration-200", isOpen && "rotate-180")}
              />
            )}
          </div>
        </div>

        {isOpen && (
          <div className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
            {showSearch && (
              <div className="flex items-center border-b px-3">
                <SearchIcon className="mr-2 size-4 shrink-0 opacity-50" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <ul
              ref={listboxRef}
              role="listbox"
              id="dropdown-options"
              className="max-h-60 overflow-y-auto p-1"
            >
              {filteredOptions.length === 0 ? (
                <li className="py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </li>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = multiple
                    ? (selectedValues as string[]).includes(option.value)
                    : selectedValues === option.value

                  const isFocused = focusedIndex === index
                  const isLimitReached =
                    multiple &&
                    !isSelected &&
                    maxSelectionLimit &&
                    (selectedValues as string[]).length >= maxSelectionLimit

                  return (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isLimitReached) {
                          handleSelect(option)
                        }
                      }}
                      onMouseEnter={() => setFocusedIndex(index)}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                        isFocused ? "bg-accent text-accent-foreground" : "",
                        isSelected && !multiple ? "bg-accent/40 font-medium" : "",
                        isLimitReached ? "cursor-not-allowed opacity-50" : ""
                      )}
                    >
                      <span className="flex-1 truncate">{option.label}</span>
                      {isSelected && (
                        <span className="flex items-center justify-center">
                          <CheckIcon className="size-4 text-primary" />
                        </span>
                      )}
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

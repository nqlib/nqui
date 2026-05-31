"use client"

import * as React from "react"
import type { ColumnDef, Row, Table as TanStackTable } from "@tanstack/react-table"
import { Checkbox } from "@/index"
import { Keys } from "@/lib/keyboard"
import { cn } from "@/lib/utils"

/**
 * Creates a column for row selection checkbox
 */
export function createSelectColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : false
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
  }
}

/**
 * Creates an editable cell renderer for inline editing
 */
export function createEditableCell<TData, TValue>({
  type = "text",
  className,
}: {
  type?: "text" | "number" | "email" | "tel" | "url"
  className?: string
} = {}) {
  return function EditableCell({
    getValue,
    row,
    column,
    table,
  }: {
    getValue: () => TValue
    row: Row<TData>
    column: { id: string }
    table: TanStackTable<TData>
  }) {
    const initialValue = getValue()
    const [value, setValue] = React.useState<TValue>(initialValue)

    React.useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

    const onBlur = () => {
      table.options.meta?.updateData?.(row.index, column.id, value)
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === Keys.Enter) {
        (e.currentTarget as HTMLElement).blur()
      }
      if (e.key === Keys.Escape) {
        setValue(initialValue)
        ;(e.currentTarget as HTMLElement).blur()
      }
    }

    return (
      <input
        type={type}
        value={value as string | number}
        onChange={(e) => {
          const newValue = type === "number" ? Number(e.target.value) : e.target.value
          setValue(newValue as TValue)
        }}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className={cn(
          "w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 rounded px-1 py-0.5",
          className
        )}
      />
    )
  }
}

/**
 * Helper to create columns with common configurations
 */
export function createColumnHelper<TData>() {
  return {
    /**
     * Create a select column for row selection
     */
    select: () => createSelectColumn<TData>(),

    /**
     * Create an editable text column
     */
    editable: <TValue,>(
      accessorKey: keyof TData,
      header: string,
      options?: {
        type?: "text" | "number" | "email" | "tel" | "url"
        enableSorting?: boolean
        enableFiltering?: boolean
        cellClassName?: string
      }
    ): ColumnDef<TData, TValue> => ({
      accessorKey: accessorKey as string,
      header,
      enableSorting: options?.enableSorting ?? true,
      enableColumnFilter: options?.enableFiltering ?? true,
      cell: createEditableCell<TData, TValue>({
        type: options?.type ?? "text",
        className: options?.cellClassName,
      }),
    }),

    /**
     * Create a standard column
     */
    column: <TValue,>(
      accessorKey: keyof TData,
      header: string,
      options?: {
        enableSorting?: boolean
        enableFiltering?: boolean
        cell?: (props: any) => React.ReactNode
        headerClassName?: string
        cellClassName?: string
      }
    ): ColumnDef<TData, TValue> => ({
      accessorKey: accessorKey as string,
      header,
      enableSorting: options?.enableSorting ?? true,
      enableColumnFilter: options?.enableFiltering ?? true,
      cell: options?.cell,
      meta: {
        headerClassName: options?.headerClassName,
        cellClassName: options?.cellClassName,
      },
    }),
  }
}

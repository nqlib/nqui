"use client"

import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconChevronsLeft,
  IconChevronsRight,
} from "@/components/icons"
import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
  type RowData,
} from "@tanstack/react-table"
import { Keys } from "@/lib/keyboard"
import { cn } from "@/lib/utils"
import { Button, Input } from "@/index"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "./Table"

// Extend TableMeta for inline editing
declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void
  }
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /**
   * Enable sorting functionality
   * @default true
   */
  enableSorting?: boolean
  /**
   * Enable filtering functionality
   * @default true
   */
  enableFiltering?: boolean
  /**
   * Enable pagination
   * @default true
   */
  enablePagination?: boolean
  /**
   * Enable row selection
   * @default false
   */
  enableRowSelection?: boolean
  /**
   * Enable inline editing
   * @default false
   */
  enableEditing?: boolean
  /**
   * Initial page size for pagination
   * @default 10
   */
  pageSize?: number
  /**
   * Show global search input
   * @default false
   */
  showGlobalFilter?: boolean
  /**
   * Custom global filter function
   */
  globalFilterFn?: (row: any, columnId: string, filterValue: any) => boolean
  /**
   * Initial sorting state
   */
  initialSorting?: SortingState
  /**
   * Callback when sorting changes
   */
  onSortingChange?: (sorting: SortingState) => void
  /**
   * Callback when row selection changes
   */
  onRowSelectionChange?: (selection: RowSelectionState) => void
  /**
   * Callback when data is updated (for inline editing)
   */
  onDataChange?: (data: TData[]) => void
  /**
   * Custom className for the table root
   */
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableRowSelection = false,
  enableEditing = false,
  pageSize = 10,
  showGlobalFilter = false,
  globalFilterFn,
  initialSorting,
  onSortingChange,
  onRowSelectionChange,
  onDataChange,
  className,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = React.useState<TData[]>(initialData)
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting || [])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  // Update data when initialData changes
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  // Handle sorting changes
  const handleSortingChange = React.useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const newSorting = typeof updater === "function" ? updater(sorting) : updater
      setSorting(newSorting)
      onSortingChange?.(newSorting)
    },
    [sorting, onSortingChange]
  )

  // Handle row selection changes
  const handleRowSelectionChange = React.useCallback(
    (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater
      setRowSelection(newSelection)
      onRowSelectionChange?.(newSelection)
    },
    [rowSelection, onRowSelectionChange]
  )

  // Update data function for inline editing
  const updateData = React.useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      setData((old) =>
        old.map((row, idx) => {
          if (idx === rowIndex) {
            return { ...row, [columnId]: value }
          }
          return row
        })
      )
    },
    []
  )

  // Notify parent of data changes
  React.useEffect(() => {
    if (enableEditing && onDataChange) {
      onDataChange(data)
    }
  }, [data, enableEditing, onDataChange])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: handleRowSelectionChange,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: globalFilterFn,
    enableSorting,
    enableRowSelection,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
    meta: enableEditing
      ? {
          updateData,
        }
      : undefined,
  })

  return (
    <div className={cn("space-y-4", className)}>
      {/* Global Filter */}
      {showGlobalFilter && enableFiltering && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search all columns..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Table */}
      <TableRoot>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const isSorted = header.column.getIsSorted()
                  const sortingHandler = header.column.getToggleSortingHandler()

                  return (
                    <TableHeaderCell
                      key={header.id}
                      className={cn(
                        canSort && "cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-900",
                        "!px-0.5 !py-1.5"
                      )}
                      onClick={canSort ? sortingHandler : undefined}
                      onKeyDown={(e) => {
                        if (e.key === Keys.Enter && canSort && sortingHandler) {
                          sortingHandler(e)
                        }
                      }}
                      tabIndex={canSort ? 0 : -1}
                      aria-sort={
                        isSorted === "asc"
                          ? "ascending"
                          : isSorted === "desc"
                            ? "descending"
                            : "none"
                      }
                    >
                      <div
                        className={cn(
                          canSort && "flex items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-gray-900",
                          "rounded-md px-3 py-1.5"
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <div className="flex flex-col -space-y-2">
                            <IconChevronUp
                              size={12}
                              className={cn(
                                "h-3 w-3 text-gray-900 dark:text-gray-50",
                                isSorted === "asc" ? "opacity-100" : "opacity-30"
                              )}
                              aria-hidden="true"
                            />
                            <IconChevronDown
                              size={12}
                              className={cn(
                                "h-3 w-3 text-gray-900 dark:text-gray-50",
                                isSorted === "desc" ? "opacity-100" : "opacity-30"
                              )}
                              aria-hidden="true"
                            />
                          </div>
                        )}
                      </div>
                    </TableHeaderCell>
                  )
                })}
              </TableRow>
            ))}
            {/* Column Filters Row */}
            {enableFiltering && (
              <TableRow>
                {table.getHeaderGroups()[0].headers.map((header) => (
                  <TableHeaderCell key={header.id}>
                    {header.column.getCanFilter() ? (
                      <Input
                        value={(header.column.getFilterValue() as string) ?? ""}
                        onChange={(e) => header.column.setFilterValue(e.target.value)}
                        placeholder={`Filter ${header.column.id}...`}
                        className="h-8"
                      />
                    ) : null}
                  </TableHeaderCell>
                ))}
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    row.getIsSelected() && "bg-gray-50 dark:bg-gray-900",
                    "hover:bg-gray-50 dark:hover:bg-gray-900"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableRoot>

      {/* Pagination */}
      {enablePagination && (
        <div className="flex items-center justify-between px-2">
          {enableRowSelection ? (
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
          ) : (
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} total row(s).
            </div>
          )}
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value))
                }}
                className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm"
              >
                {[10, 20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft size={16} className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft size={16} className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight size={16} className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight size={16} className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

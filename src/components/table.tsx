'use client';

import { useRef } from 'react';

import { useVirtualizer } from '@tanstack/react-virtual';
import {
    ArrowDown,
    ArrowDownUp,
    ArrowUp,
    CheckIcon,
    Columns3Cog,
    EllipsisVertical,
    Eye,
    EyeOff,
    Funnel,
    X
} from 'lucide-react';

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/ui';

import { cn, useTable } from '@/utils';
import type { Column, Person, UseTableValue } from '@/utils';

interface TableProps<TData> {
    data: TData[];
}

const TABLE_HEIGHT = 600;
const ROW_HEIGHT = 40;

function Table<TData>({ data }: TableProps<TData>) {
    const tableParentRef = useRef(null);

    const columns: Column<Person>[] = [
        {
            header: 'Id',
            accessor: 'id',
            cell: ({ id }) => <p>{id}</p>
        },
        {
            header: 'First name',
            accessor: 'firstName',
            cell: ({ firstName }) => <p>{firstName}</p>
        },
        {
            header: 'Last name',
            accessor: 'lastName',
            cell: ({ lastName }) => <p>{lastName}</p>,
            isSortable: false
        },
        {
            header: 'Email',
            accessor: 'email',
            cell: ({ email }) => <p>{email}</p>,
            isFilterable: false
        }
    ];

    const table = useTable<Person>({
        data: data as Person[],
        columns
    });

    const rowVirtualizer = useVirtualizer({
        count: table.getRows().length,
        getScrollElement: () => tableParentRef.current,
        estimateSize: () => ROW_HEIGHT,
        measureElement: (el) => el.getBoundingClientRect().height
    });

    const headers = table.getHeaders();
    const rows = table.getRows();

    return (
        <div>
            <button
                className="fixed right-8 bottom-12 flex cursor-pointer items-center gap-2 rounded-full bg-neutral-800 px-4 py-1.5 text-sm"
                onClick={() => {
                    rowVirtualizer.scrollToOffset(0, {
                        behavior: 'smooth'
                    });
                }}
            >
                <ArrowUp size={12} />
                <span>Scroll to top</span>
            </button>
            <div className="mb-3 flex items-center justify-between gap-1">
                <p className="text-sm">{rows.length} rows rendered</p>
                <div className="flex items-center gap-6">
                    <button
                        className={cn('flex cursor-pointer items-center gap-1 text-sm', {
                            invisible: table.getAppliedFilters().applied === table.getAppliedFilters().total
                        })}
                        onClick={() => table.clearFilters()}
                    >
                        <X size={12} />
                        <span>Clear all filters</span>
                    </button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="flex cursor-pointer items-center gap-2 rounded-md border border-neutral-700 px-3 py-1.5 text-sm">
                                <Columns3Cog size={14} />
                                <span>Columns</span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="flex w-fit flex-col gap-1 px-1 py-2 text-sm" align="end">
                            {headers.map((header) => (
                                <button
                                    key={header.id}
                                    className="flex cursor-pointer items-center gap-2 rounded py-1.5 pr-6 pl-2 text-left transition-colors hover:bg-neutral-900"
                                    onClick={() => table.toggleColumnVisibility(header.id)}
                                >
                                    {header.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                                    <span>{header.header}</span>
                                </button>
                            ))}
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="rounded-xl border border-neutral-700 p-0.5">
                <div className="relative isolate w-full border-separate border-spacing-0">
                    <div
                        className="both-edges z-10 grid items-center overflow-auto bg-neutral-900"
                        style={{
                            scrollbarGutter: 'stable',
                            gridTemplateColumns: `repeat(${headers.filter((h) => h.isVisible).length}, minmax(0, 1fr))`
                        }}
                    >
                        {headers
                            .filter((header) => header.isVisible)
                            .map((header, headerIdx) => (
                                <div
                                    key={header.id as string}
                                    className="border-b border-neutral-700 px-3 py-2 text-left font-normal whitespace-nowrap text-neutral-400 not-last:border-r not-last:border-neutral-700"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>{header.header}</div>

                                        <div className="flex items-center">
                                            <ColumnFilter
                                                header={header}
                                                headerIdx={headerIdx}
                                                filters={table.filters}
                                                appliedFilters={table.getAppliedFilters(header.id).applied}
                                                totalFilters={table.getAppliedFilters(header.id).total}
                                                handleFilterChange={table.handleFilterChange}
                                                clearFilters={table.clearFilters}
                                            />

                                            <ColumnSort
                                                header={header}
                                                headerIdx={headerIdx}
                                                sorts={table.sorts}
                                                handleSortChange={table.handleSortChange}
                                            />

                                            <ColumnOptions
                                                header={header}
                                                headerIdx={headerIdx}
                                                toggleFilterable={table.toggleFilterable}
                                                toggleSortable={table.toggleSortable}
                                                toggleColumnVisibility={table.toggleColumnVisibility}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>

                    <div
                        ref={tableParentRef}
                        style={{ maxHeight: TABLE_HEIGHT, overflow: 'auto', scrollbarGutter: 'stable' }}
                    >
                        <div style={{ height: rowVirtualizer.getTotalSize(), width: '100%', position: 'relative' }}>
                            {rows.length > 0 ? (
                                rowVirtualizer.getVirtualItems().map((virtualRow) => (
                                    <div
                                        key={virtualRow.key}
                                        ref={(el) => rowVirtualizer.measureElement(el)}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            transform: `translateY(${virtualRow.start}px)`,
                                            display: 'grid',
                                            gridTemplateColumns: `repeat(${headers.filter((h) => h.isVisible).length}, minmax(0, 1fr))`,
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        {rows[virtualRow.index]?.cols
                                            .filter((col) => col.isVisible)
                                            .map((col) => (
                                                <div
                                                    key={col.col.accessor as string}
                                                    className={cn(
                                                        'h-full grow-1 px-3 py-2 align-baseline not-last:border-r not-last:border-r-neutral-700',
                                                        {
                                                            'border-b border-b-neutral-700':
                                                                virtualRow.index !== data.length - 1
                                                        }
                                                    )}
                                                >
                                                    {col.cell}
                                                </div>
                                            ))}
                                    </div>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={headers.length} className="p-4 text-center italic">
                                        No data found
                                    </td>
                                </tr>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ColumnFilterProps<TData> {
    header: ReturnType<UseTableValue<TData>['getHeaders']>[number];
    headerIdx: number;
    filters: UseTableValue<TData>['filters'];
    appliedFilters: number;
    totalFilters: number;
    handleFilterChange: UseTableValue<TData>['handleFilterChange'];
    clearFilters: UseTableValue<TData>['clearFilters'];
}

function ColumnFilter<TData>({
    header,
    headerIdx,
    filters,
    appliedFilters,
    totalFilters,
    handleFilterChange,
    clearFilters
}: ColumnFilterProps<TData>) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    disabled={!header.isFilterable}
                    className={cn(
                        'cursor-pointer rounded p-1.5 transition-colors hover:bg-neutral-700 hover:text-neutral-200',
                        {
                            invisible: !header.isFilterable,
                            'order-1': !header.isSortable
                        }
                    )}
                >
                    <span className="relative">
                        <Funnel size={14} />
                        {appliedFilters !== totalFilters && (
                            <span className="absolute top-0 right-0 size-1.5 translate-x-1 -translate-y-1 rounded-full bg-green-400" />
                        )}
                    </span>
                </button>
            </PopoverTrigger>
            <PopoverContent align={headerIdx === 0 ? 'start' : 'end'}>
                <Command>
                    <CommandInput placeholder="Filter..." />
                    <CommandList className="relative">
                        <CommandEmpty>No results found</CommandEmpty>

                        <CommandGroup>
                            {appliedFilters !== totalFilters && (
                                <button
                                    className="flex w-full cursor-pointer items-center gap-1 border-b border-b-neutral-700 px-2 py-1.5 text-sm"
                                    onClick={() => clearFilters(header.id)}
                                >
                                    <X size={14} />
                                    <span>Clear filters</span>
                                </button>
                            )}
                            {filters[header.id as string]?.map((filter) => (
                                <CommandItem
                                    key={filter.value}
                                    value={filter.value.toString()}
                                    className="flex cursor-pointer items-start gap-3 transition-colors hover:bg-neutral-900"
                                    onSelect={(val) => handleFilterChange(header.id, val)}
                                >
                                    <CheckIcon
                                        size={10}
                                        className={cn('mt-0.5', {
                                            'opacity-0': !filter.checked
                                        })}
                                    />
                                    <span>{filter.value}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

interface ColumnSortProps<TData> {
    header: ReturnType<UseTableValue<TData>['getHeaders']>[number];
    headerIdx: number;
    sorts: UseTableValue<TData>['sorts'];
    handleSortChange: UseTableValue<TData>['handleSortChange'];
}

function ColumnSort<TData>({ header, headerIdx, sorts, handleSortChange }: ColumnSortProps<TData>) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    disabled={!header.isSortable}
                    className={cn(
                        'cursor-pointer rounded p-1.5 transition-colors hover:bg-neutral-700 hover:text-neutral-200',
                        {
                            invisible: !header.isSortable
                        }
                    )}
                >
                    {sorts.accessor === header.id && sorts.sort === 'asc' ? (
                        <span className="relative">
                            <ArrowUp size={14} />
                            <span className="absolute top-0 right-0 size-1.5 translate-x-1 -translate-y-1 rounded-full bg-green-400" />
                        </span>
                    ) : sorts.accessor === header.id && sorts.sort === 'desc' ? (
                        <span className="relative">
                            <ArrowDown size={14} />
                            <span className="absolute top-0 right-0 size-1.5 translate-x-1 -translate-y-1 rounded-full bg-green-400" />
                        </span>
                    ) : (
                        <ArrowDownUp size={14} />
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="flex w-32 flex-col gap-1 p-1 text-sm" align={headerIdx === 0 ? 'start' : 'end'}>
                <button
                    className="flex w-full cursor-pointer items-center justify-between gap-1 rounded px-3 py-1.5 hover:bg-neutral-900"
                    onClick={() => {
                        handleSortChange(null, 'default');
                    }}
                >
                    <div className="flex items-center gap-1">
                        <ArrowDownUp size={12} />
                        <span>Default</span>
                    </div>

                    {!sorts.accessor && <CheckIcon size={12} />}
                </button>
                <button
                    className="flex w-full cursor-pointer items-center justify-between gap-1 rounded px-3 py-1.5 hover:bg-neutral-900"
                    onClick={() => {
                        handleSortChange(header.id, 'asc');
                    }}
                >
                    <div className="flex items-center gap-1">
                        <ArrowUp size={12} />
                        <span>Asc</span>
                    </div>
                    {sorts.accessor === header.id && sorts.sort === 'asc' && <CheckIcon size={12} />}
                </button>
                <button
                    className="flex w-full cursor-pointer items-center justify-between gap-1 rounded px-3 py-1.5 hover:bg-neutral-900"
                    onClick={() => {
                        handleSortChange(header.id, 'desc');
                    }}
                >
                    <div className="flex items-center gap-1">
                        <ArrowDown size={12} />
                        <span>Desc</span>
                    </div>
                    {sorts.accessor === header.id && sorts.sort === 'desc' && <CheckIcon size={12} />}
                </button>
            </PopoverContent>
        </Popover>
    );
}

interface ColumnOptionsProps<TData> {
    header: ReturnType<UseTableValue<TData>['getHeaders']>[number];
    headerIdx: number;
    toggleSortable: UseTableValue<TData>['toggleSortable'];
    toggleFilterable: UseTableValue<TData>['toggleFilterable'];
    toggleColumnVisibility: UseTableValue<TData>['toggleColumnVisibility'];
}

function ColumnOptions<TData>({
    header,
    headerIdx,
    toggleFilterable,
    toggleSortable,
    toggleColumnVisibility
}: ColumnOptionsProps<TData>) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="order-2 cursor-pointer rounded p-1.5 transition-colors hover:bg-neutral-700 hover:text-neutral-200">
                    <EllipsisVertical size={14} />
                </button>
            </PopoverTrigger>
            <PopoverContent className="flex w-32 flex-col gap-1 p-1 text-sm" align={headerIdx === 0 ? 'start' : 'end'}>
                <button
                    className="flex w-full cursor-pointer items-center justify-between gap-1 rounded px-3 py-1.5 hover:bg-neutral-900"
                    onClick={() => toggleFilterable(header.id)}
                >
                    <div className="flex items-center gap-1">
                        <CheckIcon size={12} className={cn({ invisible: !header.isFilterable })} />
                        <span>Is Filterable</span>
                    </div>
                </button>
                <button
                    className="flex w-full cursor-pointer items-center justify-between gap-1 rounded px-3 py-1.5 hover:bg-neutral-900"
                    onClick={() => toggleSortable(header.id)}
                >
                    <div className="flex items-center gap-1">
                        <CheckIcon size={12} className={cn({ invisible: !header.isSortable })} />
                        <span>Is Sortable</span>
                    </div>
                </button>
                <button
                    className="flex w-full cursor-pointer items-center justify-between gap-1 rounded px-3 py-1.5 hover:bg-neutral-900"
                    onClick={() => toggleColumnVisibility(header.id, false)}
                >
                    <div className="flex items-center gap-1">
                        <EyeOff size={12} />
                        <span>Hide</span>
                    </div>
                </button>
            </PopoverContent>
        </Popover>
    );
}

export default Table;

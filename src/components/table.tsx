'use client';

import { useRef } from 'react';

import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowDown, ArrowDownUp, ArrowUp, CheckIcon, Funnel, X } from 'lucide-react';

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
import type { Column, Person } from '@/utils';

interface TableProps<TData> {
    data: TData[];
}

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
            cell: ({ lastName }) => <p>{lastName}</p>
        },
        {
            header: 'Email',
            accessor: 'email',
            cell: ({ email }) => <p>{email}</p>
        }
    ];

    const table = useTable<Person>({
        data: data as Person[],
        columns
    });

    const rowVirtualizer = useVirtualizer({
        count: table.getRows().length,
        getScrollElement: () => tableParentRef.current,
        estimateSize: () => 45
    });

    const headers = table.getHeaders();
    const rows = table.getRows();

    return (
        <div>
            <div className="mb-3 flex items-center justify-between gap-1">
                <p className="text-sm">{rows.length} rows rendered</p>
                <button
                    className={cn('flex cursor-pointer items-center gap-1 text-sm', {
                        invisible: table.getAppliedFilters().applied === table.getAppliedFilters().total
                    })}
                    onClick={() => table.clearFilters()}
                >
                    <X size={12} />
                    <span>Clear all filters</span>
                </button>
            </div>
            <div className="rounded-xl border border-neutral-700" ref={tableParentRef}>
                <table className="w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
                    <thead className="border-b border-neutral-700">
                        <tr>
                            {headers.map((header, headerIdx) => (
                                <th
                                    key={header.id as string}
                                    className="px-3 py-2 text-left font-normal whitespace-nowrap text-neutral-400 not-last:border-r not-last:border-neutral-700"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>{header.header}</div>

                                        <div className="flex items-center">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button className="cursor-pointer rounded p-1.5 transition-colors hover:bg-neutral-700 hover:text-neutral-200">
                                                        <span className="relative">
                                                            <Funnel size={14} />
                                                            {table.getAppliedFilters(header.id).applied !==
                                                                table.getAppliedFilters(header.id).total && (
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
                                                                {table.getAppliedFilters(header.id).applied !==
                                                                    table.getAppliedFilters(header.id).total && (
                                                                    <button
                                                                        className="flex w-full cursor-pointer items-center gap-1 border-b border-b-neutral-700 px-2 py-1.5 text-sm"
                                                                        onClick={() => table.clearFilters(header.id)}
                                                                    >
                                                                        <X size={14} />
                                                                        <span>Clear filters</span>
                                                                    </button>
                                                                )}
                                                                {table.filters[header.id as string]?.map((filter) => (
                                                                    <CommandItem
                                                                        key={filter.value}
                                                                        value={filter.value.toString()}
                                                                        className="flex cursor-pointer items-start gap-3 transition-colors hover:bg-neutral-900"
                                                                        onSelect={(val) =>
                                                                            table.handleFilterChange(header.id, val)
                                                                        }
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

                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button className="cursor-pointer rounded p-1.5 transition-colors hover:bg-neutral-700 hover:text-neutral-200">
                                                        {table.sorts.accessor === header.id &&
                                                        table.sorts.sort === 'asc' ? (
                                                            <span className="relative">
                                                                <ArrowUp size={14} />
                                                                <span className="absolute top-0 right-0 size-1.5 translate-x-1 -translate-y-1 rounded-full bg-green-400" />
                                                            </span>
                                                        ) : table.sorts.accessor === header.id &&
                                                          table.sorts.sort === 'desc' ? (
                                                            <span className="relative">
                                                                <ArrowDown size={14} />
                                                                <span className="absolute top-0 right-0 size-1.5 translate-x-1 -translate-y-1 rounded-full bg-green-400" />
                                                            </span>
                                                        ) : (
                                                            <ArrowDownUp size={14} />
                                                        )}
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="flex w-32 flex-col gap-1 p-1 text-sm"
                                                    align={headerIdx === 0 ? 'start' : 'end'}
                                                >
                                                    <button
                                                        className="flex w-full cursor-pointer items-center justify-between gap-1 rounded px-3 py-1.5 hover:bg-neutral-900"
                                                        onClick={() => {
                                                            table.handleSortChange(null, 'default');
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            <ArrowDownUp size={12} />
                                                            <span>Default</span>
                                                        </div>

                                                        {!table.sorts.accessor && <CheckIcon size={12} />}
                                                    </button>
                                                    <button
                                                        className="flex w-full cursor-pointer items-center justify-between gap-1 rounded px-3 py-1.5 hover:bg-neutral-900"
                                                        onClick={() => {
                                                            table.handleSortChange(header.id, 'asc');
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            <ArrowUp size={12} />
                                                            <span>Asc</span>
                                                        </div>
                                                        {table.sorts.accessor === header.id &&
                                                            table.sorts.sort === 'asc' && <CheckIcon size={12} />}
                                                    </button>
                                                    <button
                                                        className="flex w-full cursor-pointer items-center justify-between gap-1 rounded px-3 py-1.5 hover:bg-neutral-900"
                                                        onClick={() => {
                                                            table.handleSortChange(header.id, 'desc');
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            <ArrowDown size={12} />
                                                            <span>Desc</span>
                                                        </div>
                                                        {table.sorts.accessor === header.id &&
                                                            table.sorts.sort === 'desc' && <CheckIcon size={12} />}
                                                    </button>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.length > 0 ? (
                            rowVirtualizer.getVirtualItems().map((virtualRow) => (
                                <tr key={virtualRow.key} className="not-last:border-b not-last:border-b-neutral-700">
                                    {rows[virtualRow.index]?.cols.map((col) => (
                                        <td
                                            key={col.col.accessor as string}
                                            className="px-3 py-2 align-baseline not-last:border-r not-last:border-neutral-700"
                                        >
                                            {col.cell}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={headers.length} className="p-4 text-center italic">
                                    No data found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Table;

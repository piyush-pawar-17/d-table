'use client';

import { useState } from 'react';

/* @ts-expect-error No type defs */
import naturalSort from 'javascript-natural-sort';

export type Column<TData> = {
    header: React.ReactNode;
    accessor: keyof TData;
    cell: (col: TData) => React.ReactNode;
};

type UseTableProps<TData> = {
    data: TData[];
    columns: Column<TData>[];
};

type Sort<TData> = {
    accessor: keyof TData | null;
    sort: 'default' | 'asc' | 'desc';
};

export function useTable<TData>({ data, columns }: UseTableProps<TData>) {
    const [filters, setFilters] = useState(getDefaultFilters({ data, columns }));
    const [sorts, setSorts] = useState<Sort<TData>>({
        accessor: null,
        sort: 'default'
    });

    const getHeaders = () => {
        return columns.map((col) => ({
            header: col.header,
            id: col.accessor
        }));
    };

    const getRows = () => {
        return data
            ?.map((row, rowIdx) => {
                return {
                    id: rowIdx,
                    cols: columns.map((col) => ({
                        col,
                        cell: col.cell(row)
                    })),
                    row
                };
            })
            .filter((row) => {
                const rowsWithFilter = row.cols.map((col) => {
                    const filter = filters[col.col.accessor as string];
                    const cellValue = row.row[col.col.accessor];

                    const filterForCell = filter?.find((f) => f.value === cellValue?.toString());

                    return !!filterForCell?.checked;
                });

                return rowsWithFilter.every((isVisible) => isVisible);
            })
            .toSorted((row1, row2) => {
                if (!sorts.accessor || sorts.sort === 'default') {
                    return 0;
                }

                const r1Value = row1.row[sorts.accessor]?.toString()?.toLowerCase() || '';
                const r2Value = row2.row[sorts.accessor]?.toString()?.toLowerCase() || '';

                if (sorts.sort === 'asc') {
                    return naturalSort(r1Value, r2Value);
                } else if (sorts.sort === 'desc') {
                    return naturalSort(r2Value, r1Value);
                }

                return 0;
            });
    };

    const handleFilterChange = (accessor: keyof TData, value: string) => {
        setFilters((appliedFilters) => ({
            ...appliedFilters,
            [accessor]: appliedFilters[accessor as string].map((filterValue: { value: string; checked: boolean }) => {
                if (filterValue.value === value) {
                    return {
                        value: filterValue.value,
                        checked: !filterValue.checked
                    };
                }

                return filterValue;
            })
        }));
    };

    const handleSortChange = (accessor: keyof TData | null, sortValue: 'default' | 'asc' | 'desc') => {
        setSorts({
            accessor,
            sort: sortValue
        });
    };

    const getAppliedFilters = (accessor?: keyof TData) => {
        /**
         * If no accessor is passed return all filters
         */
        if (!accessor) {
            const filterPerKey = Object.values(filters).map((allFilters) => {
                return {
                    applied: allFilters.filter((f) => f.checked).length,
                    total: allFilters.length
                };
            });

            const totalFilters = filterPerKey.reduce(
                (totalCount, count) => ({
                    applied: totalCount.applied + count.applied,
                    total: totalCount.total + count.total
                }),
                { applied: 0, total: 0 }
            );

            return totalFilters;
        }

        const applied = filters[accessor as string].filter((f) => f.checked).length;

        return {
            applied,
            total: filters[accessor as string].length
        };
    };

    const clearFilters = (accessor?: keyof TData) => {
        const defaultFilters = getDefaultFilters({ data, columns });

        /**
         * If no accessor is passed clear all filters
         */
        if (!accessor) {
            return setFilters(defaultFilters);
        } else {
            setFilters((filters) => ({
                ...filters,
                [accessor]: defaultFilters[accessor as string]
            }));
        }
    };

    return {
        getHeaders,
        getRows,
        filters,
        sorts,
        handleFilterChange,
        handleSortChange,
        getAppliedFilters,
        clearFilters
    };
}

function getDefaultFilters<TData>({ data, columns }: UseTableProps<TData>) {
    /**
     * Generate column values for each row as an array of array objects
     * @example
     * | id | name  |
     * | 1  | name1 |
     * | 2  | name2 |
     *
     * The above rows will be converted to [[{ id: 1 }, { name: 'name1' }], [{ id: 2 }, { name: 'name2' }]]
     */
    const columnValues = data?.map((row) => columns.map((col) => ({ [col.accessor]: row[col.accessor] })));

    /**
     * Generate filters with unique values for each column using set
     */
    const filtersWithSet = columnValues.reduce<Record<string, Set<string>>>((uniqueValues, columns) => {
        columns.forEach((column) => {
            const [columnKey, columnValue] = Object.entries(column)[0];

            if (uniqueValues[columnKey]) {
                uniqueValues[columnKey].add((columnValue as string | number).toString());
            } else {
                const valuesSet = new Set([(columnValue as string | number).toString()]);
                uniqueValues[columnKey] = valuesSet;
            }
        });
        return uniqueValues;
    }, {});

    /**
     * Convert the generated filters with unique values to array from set
     */
    const filtersFromEntries = Object.fromEntries(
        Object.entries(filtersWithSet).map(([columnKey, uniqueValues]) => [
            columnKey,
            [...uniqueValues].map((uniqueValue) => ({
                value: uniqueValue,
                checked: true
            }))
        ])
    );

    return filtersFromEntries;
}

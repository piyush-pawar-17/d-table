'use client';

import { useCallback, useMemo, useState } from 'react';

/* @ts-expect-error No type defs */
import naturalSort from 'javascript-natural-sort';

export type Column<TData> = {
    header: string;
    accessor: keyof TData;
    cell: (col: TData) => React.ReactNode;
    isSortable?: boolean;
    isFilterable?: boolean;
    isVisible?: boolean;
};

type UseTableProps<TData> = {
    data: TData[];
    columns: Column<TData>[];
};

type Sort<TData> = {
    accessor: keyof TData | null;
    sort: 'default' | 'asc' | 'desc';
};

export type UseTableValue<TData> = ReturnType<typeof useTable<TData>>;

export function useTable<TData>({ data, columns }: UseTableProps<TData>) {
    const [tableColumns, setTableColumns] = useState(
        columns.map((col) => ({
            ...col,
            isFilterable: col.isFilterable ?? true,
            isSortable: col.isSortable ?? true,
            isVisible: col.isVisible ?? true
        }))
    );
    const [filters, setFilters] = useState(getDefaultFilters({ data, columns }));
    const [sorts, setSorts] = useState<Sort<TData>>({
        accessor: null,
        sort: 'default'
    });

    const headers = useMemo(
        () =>
            tableColumns.map((col) => ({
                header: col.header,
                id: col.accessor,
                isSortable: col.isSortable,
                isFilterable: col.isFilterable,
                isVisible: col.isVisible
            })),
        [tableColumns]
    );

    const rows = useMemo(
        () =>
            data
                ?.map((row, rowIdx) => {
                    return {
                        id: rowIdx,
                        cols: tableColumns.map((col) => ({
                            col,
                            cell: col.cell(row),
                            isSortable: col.isSortable ?? true,
                            isFilterable: col.isFilterable ?? true,
                            isVisible: col.isVisible ?? true
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
                }),
        [data, filters, sorts.accessor, sorts.sort, tableColumns]
    );

    const handleFilterChange = useCallback((accessor: keyof TData, value: string) => {
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
    }, []);

    const handleSortChange = useCallback((accessor: keyof TData | null, sortValue: 'default' | 'asc' | 'desc') => {
        setSorts({
            accessor,
            sort: sortValue
        });
    }, []);

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

    const clearFilters = useCallback(
        (accessor?: keyof TData) => {
            const defaultFilters = getDefaultFilters({ data, columns: tableColumns });

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
        },
        [data, tableColumns]
    );

    const toggleFilterable = useCallback((accessor: keyof TData) => {
        setTableColumns((columns) =>
            columns.map((column) => {
                if (column.accessor === accessor) {
                    return {
                        ...column,
                        isFilterable: !column.isFilterable
                    };
                }
                return column;
            })
        );
    }, []);

    const toggleSortable = useCallback((accessor: keyof TData) => {
        setTableColumns((columns) =>
            columns.map((column) => {
                if (column.accessor === accessor) {
                    return {
                        ...column,
                        isSortable: !column.isSortable
                    };
                }
                return column;
            })
        );
    }, []);

    const toggleColumnVisibility = useCallback((accessor: keyof TData, visibility?: boolean) => {
        setTableColumns((columns) =>
            columns.map((column) => {
                if (column.accessor === accessor) {
                    return {
                        ...column,
                        isVisible: visibility ?? !column.isVisible
                    };
                }
                return column;
            })
        );
    }, []);

    return {
        headers,
        rows,
        filters,
        sorts,
        handleFilterChange,
        handleSortChange,
        getAppliedFilters,
        clearFilters,
        toggleFilterable,
        toggleSortable,
        toggleColumnVisibility
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

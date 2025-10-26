import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';

/**
 * Column definition for DataTable
 */
interface DataTableColumn<T = any> {
    key: string;
    title: string;
    dataIndex?: string;
    render?: (value: any, record: T, index: number) => React.ReactNode;
    sortable?: boolean;
    filterable?: boolean;
    width?: string | number;
    align?: 'left' | 'center' | 'right';
    className?: string;
}
/**
 * Sort configuration
 */
interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}
/**
 * Filter configuration
 */
interface FilterConfig {
    [key: string]: any;
}
/**
 * DataTable props
 */
interface DataTableProps<T = any> {
    data: T[];
    columns: DataTableColumn<T>[];
    loading?: boolean;
    pagination?: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number, pageSize: number) => void;
    };
    rowSelection?: {
        selectedRowKeys: (string | number)[];
        onChange: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void;
    };
    onSort?: (sortConfig: SortConfig | null) => void;
    onFilter?: (filters: FilterConfig) => void;
    onRowClick?: (record: T, index: number) => void;
    rowKey?: string | ((record: T) => string | number);
    className?: string;
    emptyText?: string;
    size?: 'small' | 'medium' | 'large';
}
/**
 * Professional DataTable component
 * Combines the best features from crm_demo, tracc, and scheduler_demo
 */
declare function DataTable<T = any>({ data, columns, loading, pagination, rowSelection, onSort, onFilter, onRowClick, rowKey, className, emptyText, size }: DataTableProps<T>): react_jsx_runtime.JSX.Element;

export { DataTable, type DataTableColumn, type DataTableProps, type FilterConfig, type SortConfig };

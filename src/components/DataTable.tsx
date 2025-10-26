import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
  cn
} from '@santonastaso/crm-ui';

/**
 * Column definition for DataTable
 */
export interface DataTableColumn<T = any> {
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
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  [key: string]: any;
}

/**
 * DataTable props
 */
export interface DataTableProps<T = any> {
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
export function DataTable<T = any>({
  data,
  columns,
  loading = false,
  pagination,
  rowSelection,
  onSort,
  onFilter,
  onRowClick,
  rowKey = 'id',
  className,
  emptyText = 'No data available',
  size = 'medium'
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState<FilterConfig>({});

  // Get row key
  const getRowKey = (record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return (record as any)[rowKey] || index;
  };

  // Handle sort
  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable) return;

    let newSortConfig: SortConfig | null = null;

    if (!sortConfig || sortConfig.key !== column.key) {
      newSortConfig = { key: column.key, direction: 'asc' };
    } else if (sortConfig.direction === 'asc') {
      newSortConfig = { key: column.key, direction: 'desc' };
    } else {
      newSortConfig = null;
    }

    setSortConfig(newSortConfig);
    onSort?.(newSortConfig);
  };

  // Handle row selection
  const handleRowSelect = (record: T, selected: boolean) => {
    if (!rowSelection) return;

    const key = getRowKey(record, 0);
    const { selectedRowKeys, onChange } = rowSelection;

    let newSelectedKeys: (string | number)[];
    if (selected) {
      newSelectedKeys = [...selectedRowKeys, key];
    } else {
      newSelectedKeys = selectedRowKeys.filter(k => k !== key);
    }

    const selectedRows = data.filter(item => 
      newSelectedKeys.includes(getRowKey(item, 0))
    );

    onChange(newSelectedKeys, selectedRows);
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (!rowSelection) return;

    const { onChange } = rowSelection;
    
    if (selected) {
      const allKeys = data.map((item, index) => getRowKey(item, index));
      onChange(allKeys, data);
    } else {
      onChange([], []);
    }
  };

  // Check if all rows are selected
  const isAllSelected = useMemo(() => {
    if (!rowSelection || data.length === 0) return false;
    return data.every((item, index) => 
      rowSelection.selectedRowKeys.includes(getRowKey(item, index))
    );
  }, [rowSelection?.selectedRowKeys, data, rowKey]);

  // Check if some rows are selected
  const isSomeSelected = useMemo(() => {
    if (!rowSelection || data.length === 0) return false;
    return rowSelection.selectedRowKeys.length > 0 && !isAllSelected;
  }, [rowSelection?.selectedRowKeys, data, isAllSelected]);

  // Render cell content
  const renderCell = (column: DataTableColumn<T>, record: T, index: number) => {
    const value = column.dataIndex ? (record as any)[column.dataIndex] : record;
    
    if (column.render) {
      return column.render(value, record, index);
    }

    // Default rendering for common types
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      );
    }

    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">—</span>;
    }

    return String(value);
  };

  // Size classes
  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  const cellPaddingClasses = {
    small: 'px-2 py-1',
    medium: 'px-3 py-2',
    large: 'px-4 py-3'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">{emptyText}</div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <Table className={sizeClasses[size]}>
        <TableHeader>
          <TableRow>
            {rowSelection && (
              <TableHead className={cellPaddingClasses[size]}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={input => {
                    if (input) input.indeterminate = isSomeSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-border"
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  cellPaddingClasses[size],
                  column.sortable && 'cursor-pointer hover:bg-muted/50',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.className
                )}
                style={{ width: column.width }}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-2">
                  {column.title}
                  {column.sortable && sortConfig?.key === column.key && (
                    <span className="text-xs">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record, index) => {
            const key = getRowKey(record, index);
            const isSelected = rowSelection?.selectedRowKeys.includes(key) || false;

            return (
              <TableRow
                key={key}
                className={cn(
                  onRowClick && 'cursor-pointer',
                  isSelected && 'bg-muted/50'
                )}
                onClick={() => onRowClick?.(record, index)}
              >
                {rowSelection && (
                  <TableCell className={cellPaddingClasses[size]}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleRowSelect(record, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-border"
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      cellPaddingClasses[size],
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.className
                    )}
                  >
                    {renderCell(column, record, index)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {pagination && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.current - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              disabled={pagination.current <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

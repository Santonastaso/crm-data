// src/components/DataTable.tsx
import { useState, useMemo } from "react";
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
} from "@andrea/crm-ui";
import { jsx, jsxs } from "react/jsx-runtime";
function DataTable({
  data,
  columns,
  loading = false,
  pagination,
  rowSelection,
  onSort,
  onFilter,
  onRowClick,
  rowKey = "id",
  className,
  emptyText = "No data available",
  size = "medium"
}) {
  const [sortConfig, setSortConfig] = useState(null);
  const [filters, setFilters] = useState({});
  const getRowKey = (record, index) => {
    if (typeof rowKey === "function") {
      return rowKey(record);
    }
    return record[rowKey] || index;
  };
  const handleSort = (column) => {
    if (!column.sortable) return;
    let newSortConfig = null;
    if (!sortConfig || sortConfig.key !== column.key) {
      newSortConfig = { key: column.key, direction: "asc" };
    } else if (sortConfig.direction === "asc") {
      newSortConfig = { key: column.key, direction: "desc" };
    } else {
      newSortConfig = null;
    }
    setSortConfig(newSortConfig);
    onSort?.(newSortConfig);
  };
  const handleRowSelect = (record, selected) => {
    if (!rowSelection) return;
    const key = getRowKey(record, 0);
    const { selectedRowKeys, onChange } = rowSelection;
    let newSelectedKeys;
    if (selected) {
      newSelectedKeys = [...selectedRowKeys, key];
    } else {
      newSelectedKeys = selectedRowKeys.filter((k) => k !== key);
    }
    const selectedRows = data.filter(
      (item) => newSelectedKeys.includes(getRowKey(item, 0))
    );
    onChange(newSelectedKeys, selectedRows);
  };
  const handleSelectAll = (selected) => {
    if (!rowSelection) return;
    const { onChange } = rowSelection;
    if (selected) {
      const allKeys = data.map((item, index) => getRowKey(item, index));
      onChange(allKeys, data);
    } else {
      onChange([], []);
    }
  };
  const isAllSelected = useMemo(() => {
    if (!rowSelection || data.length === 0) return false;
    return data.every(
      (item, index) => rowSelection.selectedRowKeys.includes(getRowKey(item, index))
    );
  }, [rowSelection?.selectedRowKeys, data, rowKey]);
  const isSomeSelected = useMemo(() => {
    if (!rowSelection || data.length === 0) return false;
    return rowSelection.selectedRowKeys.length > 0 && !isAllSelected;
  }, [rowSelection?.selectedRowKeys, data, isAllSelected]);
  const renderCell = (column, record, index) => {
    const value = column.dataIndex ? record[column.dataIndex] : record;
    if (column.render) {
      return column.render(value, record, index);
    }
    if (typeof value === "boolean") {
      return /* @__PURE__ */ jsx(Badge, { variant: value ? "default" : "secondary", children: value ? "Yes" : "No" });
    }
    if (value === null || value === void 0) {
      return /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "\u2014" });
    }
    return String(value);
  };
  const sizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base"
  };
  const cellPaddingClasses = {
    small: "px-2 py-1",
    medium: "px-3 py-2",
    large: "px-4 py-3"
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: "Loading..." }) });
  }
  if (data.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: emptyText }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: cn("w-full", className), children: [
    /* @__PURE__ */ jsxs(Table, { className: sizeClasses[size], children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        rowSelection && /* @__PURE__ */ jsx(TableHead, { className: cellPaddingClasses[size], children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked: isAllSelected,
            ref: (input) => {
              if (input) input.indeterminate = isSomeSelected;
            },
            onChange: (e) => handleSelectAll(e.target.checked),
            className: "rounded border-border"
          }
        ) }),
        columns.map((column) => /* @__PURE__ */ jsx(
          TableHead,
          {
            className: cn(
              cellPaddingClasses[size],
              column.sortable && "cursor-pointer hover:bg-muted/50",
              column.align === "center" && "text-center",
              column.align === "right" && "text-right",
              column.className
            ),
            style: { width: column.width },
            onClick: () => handleSort(column),
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              column.title,
              column.sortable && sortConfig?.key === column.key && /* @__PURE__ */ jsx("span", { className: "text-xs", children: sortConfig.direction === "asc" ? "\u2191" : "\u2193" })
            ] })
          },
          column.key
        ))
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: data.map((record, index) => {
        const key = getRowKey(record, index);
        const isSelected = rowSelection?.selectedRowKeys.includes(key) || false;
        return /* @__PURE__ */ jsxs(
          TableRow,
          {
            className: cn(
              onRowClick && "cursor-pointer",
              isSelected && "bg-muted/50"
            ),
            onClick: () => onRowClick?.(record, index),
            children: [
              rowSelection && /* @__PURE__ */ jsx(TableCell, { className: cellPaddingClasses[size], children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: isSelected,
                  onChange: (e) => handleRowSelect(record, e.target.checked),
                  onClick: (e) => e.stopPropagation(),
                  className: "rounded border-border"
                }
              ) }),
              columns.map((column) => /* @__PURE__ */ jsx(
                TableCell,
                {
                  className: cn(
                    cellPaddingClasses[size],
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    column.className
                  ),
                  children: renderCell(column, record, index)
                },
                column.key
              ))
            ]
          },
          key
        );
      }) })
    ] }),
    pagination && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-2 py-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
        "Showing ",
        (pagination.current - 1) * pagination.pageSize + 1,
        " to",
        " ",
        Math.min(pagination.current * pagination.pageSize, pagination.total),
        " of",
        " ",
        pagination.total,
        " entries"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => pagination.onChange(pagination.current - 1, pagination.pageSize),
            disabled: pagination.current <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ jsxs("span", { className: "text-sm", children: [
          "Page ",
          pagination.current,
          " of ",
          Math.ceil(pagination.total / pagination.pageSize)
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => pagination.onChange(pagination.current + 1, pagination.pageSize),
            disabled: pagination.current >= Math.ceil(pagination.total / pagination.pageSize),
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}

export {
  DataTable
};
//# sourceMappingURL=chunk-NWKVG6GZ.js.map
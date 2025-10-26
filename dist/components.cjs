"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/components/index.ts
var components_exports = {};
__export(components_exports, {
  DataTable: () => DataTable
});
module.exports = __toCommonJS(components_exports);

// src/components/DataTable.tsx
var import_react = require("react");
var import_crm_ui = require("@andrea/crm-ui");
var import_jsx_runtime = require("react/jsx-runtime");
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
  const [sortConfig, setSortConfig] = (0, import_react.useState)(null);
  const [filters, setFilters] = (0, import_react.useState)({});
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
  const isAllSelected = (0, import_react.useMemo)(() => {
    if (!rowSelection || data.length === 0) return false;
    return data.every(
      (item, index) => rowSelection.selectedRowKeys.includes(getRowKey(item, index))
    );
  }, [rowSelection?.selectedRowKeys, data, rowKey]);
  const isSomeSelected = (0, import_react.useMemo)(() => {
    if (!rowSelection || data.length === 0) return false;
    return rowSelection.selectedRowKeys.length > 0 && !isAllSelected;
  }, [rowSelection?.selectedRowKeys, data, isAllSelected]);
  const renderCell = (column, record, index) => {
    const value = column.dataIndex ? record[column.dataIndex] : record;
    if (column.render) {
      return column.render(value, record, index);
    }
    if (typeof value === "boolean") {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_crm_ui.Badge, { variant: value ? "default" : "secondary", children: value ? "Yes" : "No" });
    }
    if (value === null || value === void 0) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-muted-foreground", children: "\u2014" });
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
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-muted-foreground", children: "Loading..." }) });
  }
  if (data.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-muted-foreground", children: emptyText }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: (0, import_crm_ui.cn)("w-full", className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_crm_ui.Table, { className: sizeClasses[size], children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_crm_ui.TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_crm_ui.TableRow, { children: [
        rowSelection && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_crm_ui.TableHead, { className: cellPaddingClasses[size], children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
        columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_crm_ui.TableHead,
          {
            className: (0, import_crm_ui.cn)(
              cellPaddingClasses[size],
              column.sortable && "cursor-pointer hover:bg-muted/50",
              column.align === "center" && "text-center",
              column.align === "right" && "text-right",
              column.className
            ),
            style: { width: column.width },
            onClick: () => handleSort(column),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [
              column.title,
              column.sortable && sortConfig?.key === column.key && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-xs", children: sortConfig.direction === "asc" ? "\u2191" : "\u2193" })
            ] })
          },
          column.key
        ))
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_crm_ui.TableBody, { children: data.map((record, index) => {
        const key = getRowKey(record, index);
        const isSelected = rowSelection?.selectedRowKeys.includes(key) || false;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          import_crm_ui.TableRow,
          {
            className: (0, import_crm_ui.cn)(
              onRowClick && "cursor-pointer",
              isSelected && "bg-muted/50"
            ),
            onClick: () => onRowClick?.(record, index),
            children: [
              rowSelection && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_crm_ui.TableCell, { className: cellPaddingClasses[size], children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "input",
                {
                  type: "checkbox",
                  checked: isSelected,
                  onChange: (e) => handleRowSelect(record, e.target.checked),
                  onClick: (e) => e.stopPropagation(),
                  className: "rounded border-border"
                }
              ) }),
              columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_crm_ui.TableCell,
                {
                  className: (0, import_crm_ui.cn)(
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
    pagination && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between px-2 py-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-sm text-muted-foreground", children: [
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
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_crm_ui.Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => pagination.onChange(pagination.current - 1, pagination.pageSize),
            disabled: pagination.current <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-sm", children: [
          "Page ",
          pagination.current,
          " of ",
          Math.ceil(pagination.total / pagination.pageSize)
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_crm_ui.Button,
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DataTable
});
//# sourceMappingURL=components.cjs.map
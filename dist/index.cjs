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

// src/index.ts
var src_exports = {};
__export(src_exports, {
  BaseService: () => BaseService,
  DataTable: () => DataTable,
  useDataService: () => useDataService
});
module.exports = __toCommonJS(src_exports);

// src/services/BaseService.ts
var BaseService = class {
  constructor(client, tableName) {
    this.client = client;
    this.tableName = tableName;
  }
  /**
   * Get all records with advanced filtering and pagination
   */
  async getAll(options = {}) {
    try {
      let query = this.client.from(this.tableName).select(options.select || "*").order(options.orderBy || "created_at", { ascending: options.ascending !== false });
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== null && value !== void 0 && value !== "") {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === "string" && value.includes("%")) {
              query = query.like(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }
      if (options.dateRange) {
        const { startDate, endDate, dateField = "created_at" } = options.dateRange;
        if (startDate) {
          query = query.gte(dateField, `${startDate}T00:00:00.000Z`);
        }
        if (endDate) {
          query = query.lte(dateField, `${endDate}T23:59:59.999Z`);
        }
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      const { data, error } = await query;
      if (error) {
        throw new Error(this.handleSupabaseError(error, `${this.tableName}.getAll`));
      }
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch ${this.tableName}: ${error.message}`);
    }
  }
  /**
   * Get paginated records with total count
   */
  async getPaginated(options = {}) {
    const page = options.page || 1;
    const perPage = options.perPage || 10;
    const offset = (page - 1) * perPage;
    const totalCount = await this.count(options.filters);
    const data = await this.getAll({
      ...options,
      limit: perPage,
      offset
    });
    return {
      data,
      total: totalCount,
      page,
      perPage,
      totalPages: Math.ceil(totalCount / perPage)
    };
  }
  /**
   * Get a record by ID
   */
  async getById(id, select = "*") {
    try {
      const { data, error } = await this.client.from(this.tableName).select(select).eq("id", id).single();
      if (error) {
        throw new Error(this.handleSupabaseError(error, `${this.tableName}.getById`));
      }
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch ${this.tableName} by ID: ${error.message}`);
    }
  }
  /**
   * Create a new record
   */
  async create(data) {
    try {
      const { data: result, error } = await this.client.from(this.tableName).insert(data).select().single();
      if (error) {
        throw new Error(this.handleSupabaseError(error, `${this.tableName}.create`));
      }
      return result;
    } catch (error) {
      throw new Error(`Failed to create ${this.tableName}: ${error.message}`);
    }
  }
  /**
   * Update a record
   */
  async update(id, data) {
    try {
      const { data: result, error } = await this.client.from(this.tableName).update(data).eq("id", id).select().single();
      if (error) {
        throw new Error(this.handleSupabaseError(error, `${this.tableName}.update`));
      }
      return result;
    } catch (error) {
      throw new Error(`Failed to update ${this.tableName}: ${error.message}`);
    }
  }
  /**
   * Delete a record
   */
  async delete(id) {
    try {
      const { error } = await this.client.from(this.tableName).delete().eq("id", id);
      if (error) {
        throw new Error(this.handleSupabaseError(error, `${this.tableName}.delete`));
      }
    } catch (error) {
      throw new Error(`Failed to delete ${this.tableName}: ${error.message}`);
    }
  }
  /**
   * Bulk delete records
   */
  async bulkDelete(ids) {
    try {
      const { error } = await this.client.from(this.tableName).delete().in("id", ids);
      if (error) {
        throw new Error(this.handleSupabaseError(error, `${this.tableName}.bulkDelete`));
      }
    } catch (error) {
      throw new Error(`Failed to bulk delete ${this.tableName}: ${error.message}`);
    }
  }
  /**
   * Count records with optional filters
   */
  async count(filters) {
    try {
      let query = this.client.from(this.tableName).select("*", { count: "exact", head: true });
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== void 0 && value !== "") {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }
      const { count, error } = await query;
      if (error) {
        throw new Error(this.handleSupabaseError(error, `${this.tableName}.count`));
      }
      return count || 0;
    } catch (error) {
      throw new Error(`Failed to count ${this.tableName}: ${error.message}`);
    }
  }
  /**
   * Search records with text search
   */
  async search(searchTerm, searchFields = ["name"], options = {}) {
    try {
      let query = this.client.from(this.tableName).select(options.select || "*");
      if (searchFields.length === 1) {
        query = query.ilike(searchFields[0], `%${searchTerm}%`);
      } else {
        const orConditions = searchFields.map((field) => `${field}.ilike.%${searchTerm}%`).join(",");
        query = query.or(orConditions);
      }
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== null && value !== void 0 && value !== "") {
            query = query.eq(key, value);
          }
        });
      }
      query = query.order(options.orderBy || "created_at", { ascending: options.ascending !== false });
      if (options.limit) {
        query = query.limit(options.limit);
      }
      const { data, error } = await query;
      if (error) {
        throw new Error(this.handleSupabaseError(error, `${this.tableName}.search`));
      }
      return data || [];
    } catch (error) {
      throw new Error(`Failed to search ${this.tableName}: ${error.message}`);
    }
  }
  /**
   * Handle Supabase errors with user-friendly messages
   */
  handleSupabaseError(error, context = "") {
    if (error.code === "23505") {
      return "This record already exists";
    } else if (error.code === "23503") {
      return "Cannot perform this operation due to related records";
    } else if (error.code === "PGRST116") {
      return "No records found";
    } else if (error.message?.includes("JWT")) {
      return "Authentication error. Please refresh the page";
    }
    return error.message || "An unexpected error occurred";
  }
};

// src/hooks/useDataService.ts
var import_react_query = require("@tanstack/react-query");
function useDataService(service, resourceName) {
  const queryClient = (0, import_react_query.useQueryClient)();
  const useGetAll = (options = {}, queryOptions) => {
    return (0, import_react_query.useQuery)({
      queryKey: [resourceName, "list", options],
      queryFn: () => service.getAll(options),
      ...queryOptions
    });
  };
  const useGetPaginated = (options = {}, queryOptions) => {
    return (0, import_react_query.useQuery)({
      queryKey: [resourceName, "paginated", options],
      queryFn: () => service.getPaginated(options),
      ...queryOptions
    });
  };
  const useGetById = (id, select = "*", queryOptions) => {
    return (0, import_react_query.useQuery)({
      queryKey: [resourceName, "detail", id, select],
      queryFn: () => service.getById(id, select),
      enabled: id !== null && id !== void 0,
      ...queryOptions
    });
  };
  const useSearch = (searchTerm, searchFields = ["name"], options = {}, queryOptions) => {
    return (0, import_react_query.useQuery)({
      queryKey: [resourceName, "search", searchTerm, searchFields, options],
      queryFn: () => service.search(searchTerm, searchFields, options),
      enabled: searchTerm.length > 0,
      ...queryOptions
    });
  };
  const useCount = (filters, queryOptions) => {
    return (0, import_react_query.useQuery)({
      queryKey: [resourceName, "count", filters],
      queryFn: () => service.count(filters),
      ...queryOptions
    });
  };
  const useCreate = () => {
    return (0, import_react_query.useMutation)({
      mutationFn: (data) => service.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [resourceName] });
      }
    });
  };
  const useUpdate = () => {
    return (0, import_react_query.useMutation)({
      mutationFn: ({ id, data }) => service.update(id, data),
      onSuccess: (data, variables) => {
        queryClient.setQueryData([resourceName, "detail", variables.id], data);
        queryClient.invalidateQueries({ queryKey: [resourceName, "list"] });
        queryClient.invalidateQueries({ queryKey: [resourceName, "paginated"] });
      }
    });
  };
  const useDelete = () => {
    return (0, import_react_query.useMutation)({
      mutationFn: (id) => service.delete(id),
      onSuccess: (_, variables) => {
        queryClient.removeQueries({ queryKey: [resourceName, "detail", variables] });
        queryClient.invalidateQueries({ queryKey: [resourceName, "list"] });
        queryClient.invalidateQueries({ queryKey: [resourceName, "paginated"] });
      }
    });
  };
  const useBulkDelete = () => {
    return (0, import_react_query.useMutation)({
      mutationFn: (ids) => service.bulkDelete(ids),
      onSuccess: (_, variables) => {
        variables.forEach((id) => {
          queryClient.removeQueries({ queryKey: [resourceName, "detail", id] });
        });
        queryClient.invalidateQueries({ queryKey: [resourceName, "list"] });
        queryClient.invalidateQueries({ queryKey: [resourceName, "paginated"] });
      }
    });
  };
  return {
    // Queries
    useGetAll,
    useGetPaginated,
    useGetById,
    useSearch,
    useCount,
    // Mutations
    useCreate,
    useUpdate,
    useDelete,
    useBulkDelete,
    // Utilities
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: [resourceName] }),
    invalidateList: () => {
      queryClient.invalidateQueries({ queryKey: [resourceName, "list"] });
      queryClient.invalidateQueries({ queryKey: [resourceName, "paginated"] });
    },
    invalidateDetail: (id) => queryClient.invalidateQueries({ queryKey: [resourceName, "detail", id] })
  };
}

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
  BaseService,
  DataTable,
  useDataService
});
//# sourceMappingURL=index.cjs.map
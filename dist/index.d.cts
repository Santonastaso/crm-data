import { BaseService, QueryOptions, PaginationOptions } from './services.cjs';
import * as _tanstack_query_core from '@tanstack/query-core';
import * as _tanstack_react_query from '@tanstack/react-query';
import { UseQueryOptions } from '@tanstack/react-query';
export { DataTable, DataTableColumn, DataTableProps, FilterConfig, SortConfig } from './components.cjs';
import '@supabase/supabase-js';
import 'react/jsx-runtime';
import 'react';

/**
 * Hook for data service operations with React Query
 */
declare function useDataService<T = any>(service: BaseService, resourceName: string): {
    useGetAll: (options?: QueryOptions, queryOptions?: Omit<UseQueryOptions<T[], Error>, "queryKey" | "queryFn">) => _tanstack_react_query.UseQueryResult<T[], Error>;
    useGetPaginated: (options?: QueryOptions & PaginationOptions, queryOptions?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">) => _tanstack_react_query.UseQueryResult<any, Error>;
    useGetById: (id: string | number | null, select?: string, queryOptions?: Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">) => _tanstack_react_query.UseQueryResult<_tanstack_query_core.NoInfer<T>, Error>;
    useSearch: (searchTerm: string, searchFields?: string[], options?: QueryOptions, queryOptions?: Omit<UseQueryOptions<T[], Error>, "queryKey" | "queryFn">) => _tanstack_react_query.UseQueryResult<T[], Error>;
    useCount: (filters?: Record<string, any>, queryOptions?: Omit<UseQueryOptions<number, Error>, "queryKey" | "queryFn">) => _tanstack_react_query.UseQueryResult<number, Error>;
    useCreate: () => _tanstack_react_query.UseMutationResult<any, Error, Record<string, any>, unknown>;
    useUpdate: () => _tanstack_react_query.UseMutationResult<any, Error, {
        id: string | number;
        data: Record<string, any>;
    }, unknown>;
    useDelete: () => _tanstack_react_query.UseMutationResult<void, Error, string | number, unknown>;
    useBulkDelete: () => _tanstack_react_query.UseMutationResult<void, Error, (string | number)[], unknown>;
    invalidateAll: () => Promise<void>;
    invalidateList: () => void;
    invalidateDetail: (id: string | number) => Promise<void>;
};

export { BaseService, PaginationOptions, QueryOptions, useDataService };

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { BaseService, QueryOptions, PaginationOptions } from '../services/BaseService';

/**
 * Hook for data service operations with React Query
 */
export function useDataService<T = any>(service: BaseService, resourceName: string) {
  const queryClient = useQueryClient();

  // Get all records
  const useGetAll = (
    options: QueryOptions = {},
    queryOptions?: Omit<UseQueryOptions<T[], Error>, 'queryKey' | 'queryFn'>
  ) => {
    return useQuery({
      queryKey: [resourceName, 'list', options],
      queryFn: () => service.getAll(options),
      ...queryOptions,
    });
  };

  // Get paginated records
  const useGetPaginated = (
    options: QueryOptions & PaginationOptions = {},
    queryOptions?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
  ) => {
    return useQuery({
      queryKey: [resourceName, 'paginated', options],
      queryFn: () => service.getPaginated(options),
      ...queryOptions,
    });
  };

  // Get record by ID
  const useGetById = (
    id: string | number | null,
    select = '*',
    queryOptions?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
  ) => {
    return useQuery({
      queryKey: [resourceName, 'detail', id, select],
      queryFn: () => service.getById(id!, select),
      enabled: id !== null && id !== undefined,
      ...queryOptions,
    });
  };

  // Search records
  const useSearch = (
    searchTerm: string,
    searchFields: string[] = ['name'],
    options: QueryOptions = {},
    queryOptions?: Omit<UseQueryOptions<T[], Error>, 'queryKey' | 'queryFn'>
  ) => {
    return useQuery({
      queryKey: [resourceName, 'search', searchTerm, searchFields, options],
      queryFn: () => service.search(searchTerm, searchFields, options),
      enabled: searchTerm.length > 0,
      ...queryOptions,
    });
  };

  // Count records
  const useCount = (
    filters?: Record<string, any>,
    queryOptions?: Omit<UseQueryOptions<number, Error>, 'queryKey' | 'queryFn'>
  ) => {
    return useQuery({
      queryKey: [resourceName, 'count', filters],
      queryFn: () => service.count(filters),
      ...queryOptions,
    });
  };

  // Create mutation
  const useCreate = () => {
    return useMutation({
      mutationFn: (data: Record<string, any>) => service.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [resourceName] });
      },
    });
  };

  // Update mutation
  const useUpdate = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string | number; data: Record<string, any> }) => 
        service.update(id, data),
      onSuccess: (data, variables) => {
        queryClient.setQueryData([resourceName, 'detail', variables.id], data);
        queryClient.invalidateQueries({ queryKey: [resourceName, 'list'] });
        queryClient.invalidateQueries({ queryKey: [resourceName, 'paginated'] });
      },
    });
  };

  // Delete mutation
  const useDelete = () => {
    return useMutation({
      mutationFn: (id: string | number) => service.delete(id),
      onSuccess: (_, variables) => {
        queryClient.removeQueries({ queryKey: [resourceName, 'detail', variables] });
        queryClient.invalidateQueries({ queryKey: [resourceName, 'list'] });
        queryClient.invalidateQueries({ queryKey: [resourceName, 'paginated'] });
      },
    });
  };

  // Bulk delete mutation
  const useBulkDelete = () => {
    return useMutation({
      mutationFn: (ids: (string | number)[]) => service.bulkDelete(ids),
      onSuccess: (_, variables) => {
        variables.forEach(id => {
          queryClient.removeQueries({ queryKey: [resourceName, 'detail', id] });
        });
        queryClient.invalidateQueries({ queryKey: [resourceName, 'list'] });
        queryClient.invalidateQueries({ queryKey: [resourceName, 'paginated'] });
      },
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
      queryClient.invalidateQueries({ queryKey: [resourceName, 'list'] });
      queryClient.invalidateQueries({ queryKey: [resourceName, 'paginated'] });
    },
    invalidateDetail: (id: string | number) => 
      queryClient.invalidateQueries({ queryKey: [resourceName, 'detail', id] }),
  };
}
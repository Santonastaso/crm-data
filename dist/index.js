import "./chunk-YZYRFY3D.js";
import {
  BaseService
} from "./chunk-OA4J5UJ4.js";
import {
  DataTable
} from "./chunk-NWKVG6GZ.js";

// src/hooks/useDataService.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
function useDataService(service, resourceName) {
  const queryClient = useQueryClient();
  const useGetAll = (options = {}, queryOptions) => {
    return useQuery({
      queryKey: [resourceName, "list", options],
      queryFn: () => service.getAll(options),
      ...queryOptions
    });
  };
  const useGetPaginated = (options = {}, queryOptions) => {
    return useQuery({
      queryKey: [resourceName, "paginated", options],
      queryFn: () => service.getPaginated(options),
      ...queryOptions
    });
  };
  const useGetById = (id, select = "*", queryOptions) => {
    return useQuery({
      queryKey: [resourceName, "detail", id, select],
      queryFn: () => service.getById(id, select),
      enabled: id !== null && id !== void 0,
      ...queryOptions
    });
  };
  const useSearch = (searchTerm, searchFields = ["name"], options = {}, queryOptions) => {
    return useQuery({
      queryKey: [resourceName, "search", searchTerm, searchFields, options],
      queryFn: () => service.search(searchTerm, searchFields, options),
      enabled: searchTerm.length > 0,
      ...queryOptions
    });
  };
  const useCount = (filters, queryOptions) => {
    return useQuery({
      queryKey: [resourceName, "count", filters],
      queryFn: () => service.count(filters),
      ...queryOptions
    });
  };
  const useCreate = () => {
    return useMutation({
      mutationFn: (data) => service.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [resourceName] });
      }
    });
  };
  const useUpdate = () => {
    return useMutation({
      mutationFn: ({ id, data }) => service.update(id, data),
      onSuccess: (data, variables) => {
        queryClient.setQueryData([resourceName, "detail", variables.id], data);
        queryClient.invalidateQueries({ queryKey: [resourceName, "list"] });
        queryClient.invalidateQueries({ queryKey: [resourceName, "paginated"] });
      }
    });
  };
  const useDelete = () => {
    return useMutation({
      mutationFn: (id) => service.delete(id),
      onSuccess: (_, variables) => {
        queryClient.removeQueries({ queryKey: [resourceName, "detail", variables] });
        queryClient.invalidateQueries({ queryKey: [resourceName, "list"] });
        queryClient.invalidateQueries({ queryKey: [resourceName, "paginated"] });
      }
    });
  };
  const useBulkDelete = () => {
    return useMutation({
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
export {
  BaseService,
  DataTable,
  useDataService
};
//# sourceMappingURL=index.js.map
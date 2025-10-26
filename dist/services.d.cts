import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Unified query options for database operations
 */
interface QueryOptions {
    select?: string;
    orderBy?: string;
    ascending?: boolean;
    filters?: Record<string, any>;
    limit?: number;
    offset?: number;
    dateRange?: {
        startDate?: string;
        endDate?: string;
        dateField?: string;
    };
}
/**
 * Pagination options
 */
interface PaginationOptions {
    page?: number;
    perPage?: number;
}
/**
 * Advanced Base Service Class
 * Combines the best patterns from crm_demo, tracc, and scheduler_demo
 * Provides comprehensive CRUD operations with advanced filtering, pagination, and error handling
 */
declare class BaseService {
    protected client: SupabaseClient;
    protected tableName: string;
    constructor(client: SupabaseClient, tableName: string);
    /**
     * Get all records with advanced filtering and pagination
     */
    getAll(options?: QueryOptions): Promise<any[]>;
    /**
     * Get paginated records with total count
     */
    getPaginated(options?: QueryOptions & PaginationOptions): Promise<{
        data: any[];
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    }>;
    /**
     * Get a record by ID
     */
    getById(id: string | number, select?: string): Promise<any>;
    /**
     * Create a new record
     */
    create(data: Record<string, any>): Promise<any>;
    /**
     * Update a record
     */
    update(id: string | number, data: Record<string, any>): Promise<any>;
    /**
     * Delete a record
     */
    delete(id: string | number): Promise<void>;
    /**
     * Bulk delete records
     */
    bulkDelete(ids: (string | number)[]): Promise<void>;
    /**
     * Count records with optional filters
     */
    count(filters?: Record<string, any>): Promise<number>;
    /**
     * Search records with text search
     */
    search(searchTerm: string, searchFields?: string[], options?: QueryOptions): Promise<any[]>;
    /**
     * Handle Supabase errors with user-friendly messages
     */
    protected handleSupabaseError(error: any, context?: string): string;
}

export { BaseService, type PaginationOptions, type QueryOptions };

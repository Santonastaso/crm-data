import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Unified query options for database operations
 */
export interface QueryOptions {
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
export interface PaginationOptions {
  page?: number;
  perPage?: number;
}

/**
 * Advanced Base Service Class
 * Combines the best patterns from crm_demo, tracc, and scheduler_demo
 * Provides comprehensive CRUD operations with advanced filtering, pagination, and error handling
 */
export class BaseService {
  protected client: SupabaseClient;
  protected tableName: string;

  constructor(client: SupabaseClient, tableName: string) {
    this.client = client;
    this.tableName = tableName;
  }

  /**
   * Get all records with advanced filtering and pagination
   */
  async getAll(options: QueryOptions = {}): Promise<any[]> {
    try {
      let query = this.client
        .from(this.tableName)
        .select(options.select || '*')
        .order(options.orderBy || 'created_at', { ascending: options.ascending !== false });

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'string' && value.includes('%')) {
              query = query.like(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      // Apply date range filter
      if (options.dateRange) {
        const { startDate, endDate, dateField = 'created_at' } = options.dateRange;
        if (startDate) {
          query = query.gte(dateField, `${startDate}T00:00:00.000Z`);
        }
        if (endDate) {
          query = query.lte(dateField, `${endDate}T23:59:59.999Z`);
        }
      }

      // Apply pagination
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
    } catch (error: any) {
      throw new Error(`Failed to fetch ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Get paginated records with total count
   */
  async getPaginated(options: QueryOptions & PaginationOptions = {}): Promise<{
    data: any[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  }> {
    const page = options.page || 1;
    const perPage = options.perPage || 10;
    const offset = (page - 1) * perPage;

    // Get total count
    const totalCount = await this.count(options.filters);

    // Get paginated data
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
  async getById(id: string | number, select = '*'): Promise<any> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select(select)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(this.handleSupabaseError(error, `${this.tableName}.getById`));
      }

      return data;
    } catch (error: any) {
      throw new Error(`Failed to fetch ${this.tableName} by ID: ${error.message}`);
    }
  }

  /**
   * Create a new record
   */
  async create(data: Record<string, any>): Promise<any> {
    try {
      const { data: result, error } = await this.client
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new Error(this.handleSupabaseError(error, `${this.tableName}.create`));
      }

      return result;
    } catch (error: any) {
      throw new Error(`Failed to create ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Update a record
   */
  async update(id: string | number, data: Record<string, any>): Promise<any> {
    try {
      const { data: result, error } = await this.client
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(this.handleSupabaseError(error, `${this.tableName}.update`));
      }

      return result;
    } catch (error: any) {
      throw new Error(`Failed to update ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Delete a record
   */
  async delete(id: string | number): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(this.handleSupabaseError(error, `${this.tableName}.delete`));
      }
    } catch (error: any) {
      throw new Error(`Failed to delete ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Bulk delete records
   */
  async bulkDelete(ids: (string | number)[]): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .in('id', ids);

      if (error) {
        throw new Error(this.handleSupabaseError(error, `${this.tableName}.bulkDelete`));
      }
    } catch (error: any) {
      throw new Error(`Failed to bulk delete ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Count records with optional filters
   */
  async count(filters?: Record<string, any>): Promise<number> {
    try {
      let query = this.client
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
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
    } catch (error: any) {
      throw new Error(`Failed to count ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Search records with text search
   */
  async search(searchTerm: string, searchFields: string[] = ['name'], options: QueryOptions = {}): Promise<any[]> {
    try {
      let query = this.client
        .from(this.tableName)
        .select(options.select || '*');

      // Build text search query
      if (searchFields.length === 1) {
        query = query.ilike(searchFields[0], `%${searchTerm}%`);
      } else {
        // For multiple fields, use OR condition
        const orConditions = searchFields.map(field => `${field}.ilike.%${searchTerm}%`).join(',');
        query = query.or(orConditions);
      }

      // Apply additional filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            query = query.eq(key, value);
          }
        });
      }

      query = query.order(options.orderBy || 'created_at', { ascending: options.ascending !== false });

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(this.handleSupabaseError(error, `${this.tableName}.search`));
      }

      return data || [];
    } catch (error: any) {
      throw new Error(`Failed to search ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Handle Supabase errors with user-friendly messages
   */
  protected handleSupabaseError(error: any, context = ''): string {
    // User-friendly error messages
    if (error.code === '23505') {
      return 'This record already exists';
    } else if (error.code === '23503') {
      return 'Cannot perform this operation due to related records';
    } else if (error.code === 'PGRST116') {
      return 'No records found';
    } else if (error.message?.includes('JWT')) {
      return 'Authentication error. Please refresh the page';
    }
    
    return error.message || 'An unexpected error occurred';
  }
}

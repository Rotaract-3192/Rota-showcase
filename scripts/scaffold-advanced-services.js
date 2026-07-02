const fs = require('fs');
const path = require('path');

const serviceMap = {
  auth: 'member_profiles',
  club: 'clubs',
  activity: 'activities',
  meeting: 'meetings',
  orientation: 'orientations',
  installation: 'installations',
  dov: 'dovs',
  notification: 'notifications',
  analytics: 'analytics_events',
  leaderboard: 'point_ledgers',
  showcase: 'showcase_features',
  websiteBuilder: 'club_website_configs'
};

const srcDir = path.join(__dirname, '../src');

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

Object.entries(serviceMap).forEach(([serviceName, tableName]) => {
  const ClassName = capitalize(serviceName);
  
  // 1. Repository
  const repoContent = `import { BaseRepository } from './base.repository';

export class ${ClassName}Repository extends BaseRepository<'${tableName}'> {
  constructor() {
    super('${tableName}');
  }
}

export const ${serviceName}Repository = new ${ClassName}Repository();
`;
  fs.writeFileSync(path.join(srcDir, `repositories/${serviceName}.repository.ts`), repoContent);

  // 2. Service
  const serviceContent = `import { ${serviceName}Repository } from '@/repositories/${serviceName}.repository';
import type { Database } from '@/types/database.types';
import type { QueryOptions, PaginatedResponse } from '@/types/api.types';

type InsertPayload = Database['public']['Tables']['${tableName}']['Insert'];
type UpdatePayload = Database['public']['Tables']['${tableName}']['Update'];
type RowData = Database['public']['Tables']['${tableName}']['Row'];

export class ${ClassName}Service {
  /**
   * Advanced search, pagination, filtering, and sorting
   */
  async findMany(options?: QueryOptions): Promise<PaginatedResponse<RowData>> {
    return await ${serviceName}Repository.findMany(options);
  }

  async getById(id: string): Promise<RowData | null> {
    return await ${serviceName}Repository.findById(id);
  }

  async create(payload: InsertPayload): Promise<RowData> {
    return await ${serviceName}Repository.create(payload);
  }

  async update(id: string, payload: UpdatePayload): Promise<RowData> {
    return await ${serviceName}Repository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await ${serviceName}Repository.softDelete(id);
  }
}

export const ${serviceName}Service = new ${ClassName}Service();
`;
  fs.writeFileSync(path.join(srcDir, `services/${serviceName}.service.ts`), serviceContent);

  // 3. Queries (React Query)
  const queriesContent = `import { useQuery } from '@tanstack/react-query';
import { ${serviceName}Service } from '@/services/${serviceName}.service';
import type { QueryOptions } from '@/types/api.types';

export const ${serviceName}Keys = {
  all: ['${serviceName}'] as const,
  lists: () => [...${serviceName}Keys.all, 'list'] as const,
  list: (filters: string) => [...${serviceName}Keys.lists(), filters] as const,
  detail: (id: string) => [...${serviceName}Keys.all, 'detail', id] as const,
};

export function use${ClassName}List(options: QueryOptions = {}) {
  return useQuery({
    queryKey: ${serviceName}Keys.list(JSON.stringify(options)),
    queryFn: () => ${serviceName}Service.findMany(options),
  });
}

export function use${ClassName}(id: string) {
  return useQuery({
    queryKey: ${serviceName}Keys.detail(id),
    queryFn: () => ${serviceName}Service.getById(id),
    enabled: !!id,
  });
}
`;
  fs.writeFileSync(path.join(srcDir, `queries/${serviceName}.queries.ts`), queriesContent);

  // 4. Mutations (React Query)
  const mutationsContent = `import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ${serviceName}Service } from '@/services/${serviceName}.service';
import { ${serviceName}Keys } from '@/queries/${serviceName}.queries';
import type { Database } from '@/types/database.types';

export function useCreate${ClassName}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Database['public']['Tables']['${tableName}']['Insert']) => 
      ${serviceName}Service.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ${serviceName}Keys.lists() });
    },
  });
}

export function useUpdate${ClassName}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Database['public']['Tables']['${tableName}']['Update'] }) => 
      ${serviceName}Service.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ${serviceName}Keys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: ${serviceName}Keys.lists() });
    },
  });
}

export function useDelete${ClassName}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ${serviceName}Service.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ${serviceName}Keys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: ${serviceName}Keys.lists() });
    },
  });
}
`;
  fs.writeFileSync(path.join(srcDir, `mutations/${serviceName}.mutations.ts`), mutationsContent);
});

console.log('Successfully scaffolded advanced services!');

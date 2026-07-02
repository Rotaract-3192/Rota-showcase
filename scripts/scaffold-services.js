const fs = require('fs');
const path = require('path');

const modules = [
  'activities', 'registrations', 'meetings', 'orientations', 'installations', 
  'dovs', 'point_ledgers', 'notifications', 'analytics_events', 'audit_logs', 
  'showcase_features', 'club_website_configs', 'ai_jobs', 'cron_jobs'
];

const srcDir = path.join(__dirname, '../src');

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function getCamel(str) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

modules.forEach(mod => {
  const ClassName = capitalize(mod);
  const varName = getCamel(mod);
  
  // 1. Repository
  const repoContent = `import { BaseRepository } from './base.repository';

export class ${ClassName}Repository extends BaseRepository<'${mod}'> {
  constructor() {
    super('${mod}');
  }
}

export const ${varName}Repository = new ${ClassName}Repository();
`;
  fs.writeFileSync(path.join(srcDir, `repositories/${mod}.repository.ts`), repoContent);

  // 2. Service
  const serviceContent = `import { ${varName}Repository } from '@/repositories/${mod}.repository';
import type { Database } from '@/types/database.types';

export class ${ClassName}Service {
  async getAll() {
    return await ${varName}Repository.findAll();
  }

  async getById(id: string) {
    return await ${varName}Repository.findById(id);
  }

  async create(payload: Database['public']['Tables']['${mod}']['Insert']) {
    return await ${varName}Repository.create(payload);
  }

  async update(id: string, payload: Database['public']['Tables']['${mod}']['Update']) {
    return await ${varName}Repository.update(id, payload);
  }

  async delete(id: string) {
    await ${varName}Repository.softDelete(id);
  }
}

export const ${varName}Service = new ${ClassName}Service();
`;
  fs.writeFileSync(path.join(srcDir, `services/${mod}.service.ts`), serviceContent);

  // 3. Queries
  const queriesContent = `import { useQuery } from '@tanstack/react-query';
import { ${varName}Service } from '@/services/${mod}.service';

export const ${varName}Keys = {
  all: ['${mod}'] as const,
  lists: () => [...${varName}Keys.all, 'list'] as const,
  detail: (id: string) => [...${varName}Keys.all, 'detail', id] as const,
};

export function use${ClassName}() {
  return useQuery({
    queryKey: ${varName}Keys.lists(),
    queryFn: () => ${varName}Service.getAll(),
  });
}

export function use${ClassName}ById(id: string) {
  return useQuery({
    queryKey: ${varName}Keys.detail(id),
    queryFn: () => ${varName}Service.getById(id),
    enabled: !!id,
  });
}
`;
  fs.writeFileSync(path.join(srcDir, `queries/${mod}.queries.ts`), queriesContent);

  // 4. Mutations
  const mutationsContent = `import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ${varName}Service } from '@/services/${mod}.service';
import { ${varName}Keys } from '@/queries/${mod}.queries';
import type { Database } from '@/types/database.types';

export function useCreate${ClassName}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Database['public']['Tables']['${mod}']['Insert']) => 
      ${varName}Service.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ${varName}Keys.lists() });
    },
  });
}
`;
  fs.writeFileSync(path.join(srcDir, `mutations/${mod}.mutations.ts`), mutationsContent);
});

console.log('Successfully scaffolded remaining backend modules!');

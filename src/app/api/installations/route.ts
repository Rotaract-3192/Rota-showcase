import { NextRequest, NextResponse } from 'next/server';
import { installationService } from '@/services/installation.service';
import { getPortalActor, assertCanAccessClubRecord, scopedClubId } from '@/lib/portal-auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortColumn = searchParams.get('sortColumn') || undefined;
    const sortAsc = searchParams.get('sortAsc') === 'true';
    const search = searchParams.get('search') || undefined;
    const id = searchParams.get('id') || undefined;

    const actor = await getPortalActor();
    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (id) {
      const result = await installationService.getById(id);
      if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      try {
        assertCanAccessClubRecord(actor, (result as any).club_id);
      } catch {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(result);
    }

    const options: any = {
      pagination: { page, pageSize },
    };

    if (sortColumn) {
      options.sort = { column: sortColumn, ascending: sortAsc };
    }

    if (search) {
      options.search = { query: search, columns: ['title', 'description', 'name'] };
    }

    const clubId = scopedClubId(actor);
    if (!actor.isDistrict && !clubId) {
      return NextResponse.json({ data: [], count: 0, page, pageSize, totalPages: 0 });
    }
    if (clubId) {
      options.filters = { club_id: clubId };
    }

    const result = await installationService.findMany(options);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('GET /api/installations error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

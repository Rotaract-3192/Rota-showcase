import { NextRequest, NextResponse } from 'next/server';
import { activityService } from '@/services/activity.service';
import { getPortalActor, assertCanAccessClubRecord, scopedClubId } from '@/lib/portal-auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortColumn = searchParams.get('sortColumn') || undefined;
    const sortAsc = searchParams.get('sortAsc') === 'true';
    const search = searchParams.get('search') || undefined;
    const requestedClubId = searchParams.get('club_id') || undefined;
    const id = searchParams.get('id') || undefined;
    const status = searchParams.get('status') || undefined;
    const mine = searchParams.get('mine') === '1';

    const actor = await getPortalActor();

    if (id) {
      const result = await activityService.getById(id);
      if (!result) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      if (mine || actor) {
        if (!actor) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        try {
          assertCanAccessClubRecord(actor, result.club_id);
        } catch {
          return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json(result);
      }

      if (result.status !== 'PUBLISHED') {
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
      options.search = { query: search, columns: ['title', 'description'] };
    }

    options.filters = options.filters || {};

    if (mine) {
      if (!actor) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const clubId = scopedClubId(actor);
      if (!actor.isDistrict && !clubId) {
        return NextResponse.json({ data: [], count: 0, page, pageSize, totalPages: 0 });
      }
      if (clubId) {
        options.filters.club_id = clubId;
      } else if (requestedClubId) {
        options.filters.club_id = requestedClubId;
      }
    } else {
      options.filters.status = status || 'PUBLISHED';
      if (requestedClubId) {
        options.filters.club_id = requestedClubId;
      }
    }

    const result = await activityService.findMany(options);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('GET /api/activities error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

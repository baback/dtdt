import { NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';
import { v4 as uuid } from 'uuid';

// Initialize day_blocks table
async function initDayBlocksTable() {
  await initDB();
  await sql`
    CREATE TABLE IF NOT EXISTS day_blocks (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      start_hour INTEGER NOT NULL,
      end_hour INTEGER NOT NULL,
      project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(workspace_id, date, start_hour)
    )
  `;
}

// Default weekday template
const WEEKDAY_TEMPLATE = [
  { start: 8, end: 11 },
  { start: 11, end: 12 },
  { start: 12, end: 15 }, // 12-3pm
  { start: 15, end: 16 }, // 3-4pm
  { start: 16, end: 19 }, // 4-7pm
  { start: 19, end: 20 }, // 7-8pm
  { start: 20, end: 22 }, // 8-10pm
];

// Weekend template
const WEEKEND_TEMPLATE = [
  { start: 8, end: 11 },
  { start: 11, end: 14 }, // 11-2pm
  { start: 14, end: 16 }, // 2-4pm
  { start: 16, end: 18 }, // 4-6pm
];

export async function GET(request: Request) {
  try {
    await initDayBlocksTable();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');
    const date = searchParams.get('date');

    if (!workspaceId || !date) {
      return NextResponse.json({ error: 'Missing workspace_id or date' }, { status: 400 });
    }

    const { rows } = await sql`
      SELECT db.*, p.name as project_name, p.color as project_color
      FROM day_blocks db
      LEFT JOIN projects p ON db.project_id = p.id
      WHERE db.workspace_id = ${workspaceId} AND db.date = ${date}
      ORDER BY db.start_hour
    `;

    // If no blocks exist for this day, create from template
    if (rows.length === 0) {
      // Always use weekday template
      const template = WEEKDAY_TEMPLATE;

      const blocks = [];
      for (let i = 0; i < template.length; i++) {
        const block = template[i];
        const id = uuid();
        await sql`
          INSERT INTO day_blocks (id, workspace_id, date, start_hour, end_hour, sort_order)
          VALUES (${id}, ${workspaceId}, ${date}, ${block.start}, ${block.end}, ${i})
        `;
        blocks.push({
          id,
          workspace_id: workspaceId,
          date,
          start_hour: block.start,
          end_hour: block.end,
          project_id: null,
          project_name: null,
          project_color: null,
          sort_order: i,
        });
      }
      return NextResponse.json(blocks);
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error('GET /api/day-blocks error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}


// POST - Apply template to a day
export async function POST(request: Request) {
  try {
    await initDayBlocksTable();
    const { workspace_id, date, template } = await request.json();

    if (!workspace_id || !date) {
      return NextResponse.json({ error: 'Missing workspace_id or date' }, { status: 400 });
    }

    // Delete existing blocks for this day
    await sql`DELETE FROM day_blocks WHERE workspace_id = ${workspace_id} AND date = ${date}`;

    // Get template
    const templateBlocks = template === 'weekend' ? WEEKEND_TEMPLATE : WEEKDAY_TEMPLATE;

    const blocks = [];
    for (let i = 0; i < templateBlocks.length; i++) {
      const block = templateBlocks[i];
      const id = uuid();
      await sql`
        INSERT INTO day_blocks (id, workspace_id, date, start_hour, end_hour, sort_order)
        VALUES (${id}, ${workspace_id}, ${date}, ${block.start}, ${block.end}, ${i})
      `;
      blocks.push({
        id,
        workspace_id,
        date,
        start_hour: block.start,
        end_hour: block.end,
        project_id: null,
        project_name: null,
        project_color: null,
        sort_order: i,
      });
    }

    return NextResponse.json(blocks);
  } catch (error) {
    console.error('POST /api/day-blocks error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

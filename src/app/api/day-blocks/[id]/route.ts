import { NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initDB();
    const { id } = await params;
    const updates = await request.json();

    // Build update query dynamically
    if (updates.project_id !== undefined) {
      await sql`UPDATE day_blocks SET project_id = ${updates.project_id} WHERE id = ${id}`;
    }

    if (updates.start_hour !== undefined && updates.end_hour !== undefined) {
      await sql`
        UPDATE day_blocks 
        SET start_hour = ${updates.start_hour}, end_hour = ${updates.end_hour}
        WHERE id = ${id}
      `;
    }

    const { rows } = await sql`
      SELECT db.*, p.name as project_name, p.color as project_color
      FROM day_blocks db
      LEFT JOIN projects p ON db.project_id = p.id
      WHERE db.id = ${id}
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('PUT /api/day-blocks/[id] error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// Batch update all blocks for a day (for time adjustments)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initDB();
    const { id } = await params; // This will be 'batch' for batch updates
    const { blocks, workspace_id, date } = await request.json();

    if (id === 'batch' && blocks && workspace_id && date) {
      // Validate no overlaps and no gaps
      const sorted = [...blocks].sort((a, b) => a.start_hour - b.start_hour);
      
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].end_hour !== sorted[i + 1].start_hour) {
          return NextResponse.json({ 
            error: 'Invalid schedule: blocks must be continuous with no gaps or overlaps' 
          }, { status: 400 });
        }
      }

      // Update each block
      for (const block of blocks) {
        await sql`
          UPDATE day_blocks 
          SET start_hour = ${block.start_hour}, end_hour = ${block.end_hour}
          WHERE id = ${block.id}
        `;
      }

      // Fetch updated blocks
      const { rows } = await sql`
        SELECT db.*, p.name as project_name, p.color as project_color
        FROM day_blocks db
        LEFT JOIN projects p ON db.project_id = p.id
        WHERE db.workspace_id = ${workspace_id} AND db.date = ${date}
        ORDER BY db.start_hour
      `;

      return NextResponse.json(rows);
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('PATCH /api/day-blocks/[id] error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

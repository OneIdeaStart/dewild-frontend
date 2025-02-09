// src/app/api/admin/applications/[id]/route.ts
import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  try {
    const id = (await params).id;  // Добавляем await здесь
    console.log('DELETE API received request for ID:', id);
  
    const app = await DB.getApplicationById(id);
    if (!app) {
      console.log('Application not found:', id);
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    console.log('Found application:', app);
    await DB.deleteApplication(id);
    console.log('Successfully deleted application:', id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application', details: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: any
) {
  try {
    const id = (await params).id;  // И здесь тоже
    const data = await request.json();
    console.log('PATCH request for application:', id, 'Action:', data.action);

    if (data.action === 'approve') {
      await DB.updateStatus(id, 'approved');
    } else if (data.action === 'reject') {
      await DB.updateStatus(id, 'rejected');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in PATCH route:', error);
    return NextResponse.json(
      { error: 'Failed to update application', details: error?.message },
      { status: 500 }
    );
  }
}
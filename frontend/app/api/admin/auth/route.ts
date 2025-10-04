import { NextRequest, NextResponse } from 'next/server';
import { adminAuthRepo } from '@/lib/repositories/adminAuth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const isValid = await adminAuthRepo.authenticate(username, password);

    if (isValid) {
      return NextResponse.json({ authenticated: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Authentication API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if admin users exist
export async function GET() {
  try {
    const hasAdmins = await adminAuthRepo.hasAdminUsers();
    return NextResponse.json({ hasAdminUsers: hasAdmins });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
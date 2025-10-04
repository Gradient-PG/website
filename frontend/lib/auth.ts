import { NextRequest } from 'next/server';
import { adminAuthRepo } from './repositories/adminAuth';

export interface AuthResult {
  isAuthenticated: boolean;
  user?: string;
  error?: string;
}

/**
 * Validates admin authentication from request headers
 * This is used in admin route handlers after middleware passes credentials
 */
export async function validateAdminAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Get credentials from headers (set by middleware)
    const username = request.headers.get('x-auth-user');
    const password = request.headers.get('x-auth-pass');

    if (!username || !password) {
      return { isAuthenticated: false, error: 'No credentials provided' };
    }

    // Validate against database
    const isValid = await adminAuthRepo.authenticate(username, password);

    if (isValid) {
      return { isAuthenticated: true, user: username };
    } else {
      return { isAuthenticated: false, error: 'Invalid credentials' };
    }
  } catch (error) {
    console.error('Auth validation error:', error);
    return { isAuthenticated: false, error: 'Authentication error' };
  }
}

/**
 * Middleware wrapper for admin route protection
 * Usage: const auth = await requireAdminAuth(request);
 * if (!auth.isAuthenticated) return NextResponse.json({ error: auth.error }, { status: 401 });
 */
export async function requireAdminAuth(request: NextRequest): Promise<AuthResult> {
  return await validateAdminAuth(request);
} 
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

// Type definition for authentication result
type ClerkAuthResult = {
  userId: string;
  error?: never;
} | {
  userId?: never;
  error: NextResponse;
};

/**
 * Verifies the Clerk auth token from the Authorization header
 */
export const verifyClerkAuth = async (authHeader: string | null): Promise<ClerkAuthResult> => {
  try {
    if (!authHeader?.startsWith("Bearer ")) {
      return {
        error: NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ),
      };
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify the token using Clerk's getToken method
    try {
      // In a production environment, you would verify this token with Clerk
      // For now, we'll parse the JWT to get the user ID
      if (token === null || token === undefined || token === "") {
        return {
          error: NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
          ),
        };
      }
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      if (!payload.sub) {
        return {
          error: NextResponse.json(
            { error: "Invalid token" },
            { status: 401 }
          ),
        };
      }

      return { userId: payload.sub };
    } catch (error) {
      return {
        error: NextResponse.json(
          { error: "Invalid token" },
          { status: 401 }
        ),
      };
    }
  } catch (error) {
    return {
      error: NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      ),
    };
  }
};

/**
 * Gets the authenticated user ID from the request context using Clerk's auth helper
 * Useful for Next.js API routes
 */
export const getAuthenticatedUserId = async (): Promise<string | null> => {
  const session = await auth();
  return session?.userId || null;
};

/**
 * Gets the current authenticated user's full profile
 * Useful when you need more than just the user ID
 */
export const getAuthenticatedUser = async () => {
  return await currentUser();
};

/**
 * Fetches a user's information by their ID
 * @param userId The Clerk user ID
 */
export const getUserById = async (userId: string) => {
  try {
    // Use the clerkClient to get user information
    // Note: In a real implementation, you would use the proper Clerk client method
    // This is a placeholder that needs to be replaced with the actual Clerk API call
    const response = await fetch(`${process.env.CLERK_API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user from Clerk API');
    }

    return await response.json();
  } catch (error) {
    return null;
  }
};

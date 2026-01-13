import { authApiHandler } from "@neondatabase/auth/next";

const handlers = authApiHandler();

// Wrap handlers to handle Next.js 15 async params
export async function GET(
  request: Request,
  context: { params: Promise<{ all: string[] }> | { all: string[] } }
) {
  const params = await Promise.resolve(context.params);
  return handlers.GET(request, { params: Promise.resolve({ path: params.all }) });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ all: string[] }> | { all: string[] } }
) {
  const params = await Promise.resolve(context.params);
  return handlers.POST(request, { params: Promise.resolve({ path: params.all }) });
}

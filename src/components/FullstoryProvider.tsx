'use client';

import { useEffect, useRef } from 'react';
import { init, FullStory } from '@fullstory/browser';
import { useSession } from '@/lib/auth/client';

export function FullstoryProvider() {
  const { data: session } = useSession();
  const initializedRef = useRef(false);

  useEffect(() => {
    const orgId = process.env.NEXT_PUBLIC_FULLSTORY_ORG_ID;
    if (orgId && !initializedRef.current) {
      init({ orgId });
      initializedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current && session?.user) {
      FullStory.identify(session.user.id, {
        email: session.user.email,
        displayName: session.user.name || undefined,
      });
    }
  }, [session]);

  return null;
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';
import { createClient } from '@/lib/supabase/client';

export function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Get initial user state
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 w-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user.email}
        </span>
        <Button
          variant="outlined"
          size="sm"
          onClick={handleSignOut}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="solid"
      size="sm"
      onClick={() => router.push('/auth/login')}
      className="bg-black text-white hover:bg-gray-800"
    >
      Sign In
    </Button>
  );
}

export default AuthButton;
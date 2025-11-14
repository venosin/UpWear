'use client';

import { Button } from './ui/Button';
import Link from 'next/link';

export function DeployButton() {
  return (
    <Link href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase">
      <Button
        variant="solid"
        size="sm"
        className="bg-black text-white hover:bg-gray-800"
      >
        Deploy to Vercel
      </Button>
    </Link>
  );
}

export default DeployButton;
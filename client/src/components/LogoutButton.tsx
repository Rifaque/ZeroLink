// components/LogoutButton.tsx
'use client';

import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <button onClick={handleLogout} className="bg-red-500 px-4 py-2 text-white rounded">
      Logout
    </button>
  );
}

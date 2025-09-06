"use client";

import { Button } from '@/components/ui/button';
import { logout } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from "sonner";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast("You have been logged out");
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Button 
      onClick={handleLogout} 
    //   variant="outline" 
      className="flex items-center gap-2 bg-white"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}

import { Button } from '@/components/ui/button';
import { auth, signOut } from '@/lib/auth';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export async function User() {
  let session = await auth();
  let user = session?.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full border-2 border-purple-600 hover:bg-purple-100 hover:scale-105 transition-transform duration-200 ease-in-out"
        >
          <Image
            src={user?.image ?? '/placeholder-user.jpg'}
            width={40}
            height={40}
            alt="User Avatar"
            className="rounded-full"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="shadow-xl rounded-lg bg-white p-4">
        <DropdownMenuLabel className="font-semibold text-gray-900">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/help" className="text-gray-700 hover:text-purple-600">
            Help
          </Link>
        </DropdownMenuItem>
        {user ? (
          <>
            <DropdownMenuItem>
              <Link href="/account" className="text-gray-700 hover:text-purple-600">
                My Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <form
                action={async () => {
                  'use server';
                  await signOut();
                }}
              >
                <button type="submit" className="w-full text-left text-gray-700 hover:text-red-500">
                  Sign Out
                </button>
              </form>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem>
            <Link href="/login" className="text-gray-700 hover:text-purple-600">
              Sign In
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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

  // Log para mostrar toda la información del usuario
  console.log("User session info:", session);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full border-2 border-indigo-600 hover:bg-indigo-100 transition-all"
        >
          <Image
            src={user?.image ?? '/placeholder-user.jpg'}
            width={36}
            height={36}
            alt="Avatar"
            className="rounded-full"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="shadow-lg rounded-lg bg-white">
        <DropdownMenuLabel className="font-bold text-gray-800">Mi Cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/help" className="text-gray-600 hover:text-indigo-600">
            Ayuda
          </Link>
        </DropdownMenuItem>
        {user ? (
          <>
            <DropdownMenuItem>
              <Link href="/account" className="text-gray-600 hover:text-indigo-600">
                Mi Cuenta
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
                <button type="submit" className="w-full text-left text-gray-600 hover:text-red-600">
                  Cerrar sesión
                </button>
              </form>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem>
            <Link href="/login" className="text-gray-600 hover:text-indigo-600">
              Iniciar sesión
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

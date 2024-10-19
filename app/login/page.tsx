import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { signIn } from '@/lib/auth';
import { FaGoogle, FaGithub } from 'react-icons/fa';

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex justify-center items-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8"
      style={{ backgroundImage: 'url(/auth-background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-lg shadow-2xl rounded-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back!
          </CardTitle>
          <CardDescription className="text-gray-500 text-sm">
            Please sign in using your preferred platform
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-4 p-8">
          {/* Google Sign-In */}
          <form
            action={async () => {
              'use server';
              await signIn('google', {
                redirectTo: '/'
              });
            }}
            className="w-full"
          >
            <Button
              className="w-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg"
              size="lg"
            >
              <FaGoogle className="text-xl" />
              Sign in with Google
            </Button>
          </form>

          {/* GitHub Sign-In */}
          <form
            action={async () => {
              'use server';
              await signIn('github', {
                redirectTo: '/'
              });
            }}
            className="w-full"
          >
            <Button
              className="w-full bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg"
              size="lg"
            >
              <FaGithub className="text-xl" />
              Sign in with GitHub
            </Button>
          </form>

          <p className="text-center text-gray-500 text-xs mt-4">
            By signing in, you agree to our <a href="#" className="underline text-indigo-600 hover:text-indigo-800">Terms of Service</a> and <a href="#" className="underline text-indigo-600 hover:text-indigo-800">Privacy Policy</a>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

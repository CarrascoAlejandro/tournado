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
      className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 p-8"
      style={{ backgroundImage: 'url(/static/background1.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-2xl rounded-lg overflow-hidden">
        <div className="flex justify-center p-6">
          <img 
            src="/static/Winners-bro.png" 
            alt="Login illustration" 
            className="w-1/2 object-contain"
          />
        </div>
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-extrabold text-gray-800 mb-2">
            Welcome Back!
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm">
            Sign in using your preferred platform
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
              className="w-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-lg rounded-lg py-3"
              size="lg"
            >
              <FaGoogle className="text-2xl" />
              Sign in with Google
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

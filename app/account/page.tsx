import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/lib/db'; // Ensure the function is imported to fetch the user

export default async function AccountPage() {
  const session = await auth();

  // Redirect to login page if no session is active
  if (!session) {
    redirect('/login');
  }

  const userEmail = session.user?.email;
  const userImage = session.user?.image;

  // Fetch user information by email
  const user = await getUserByEmail(userEmail!);
  if (!user) {
    return <p>User not found.</p>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 via-white to-indigo-100 p-8">
      <div id="google_translate_element"></div>
      <div className="flex bg-white shadow-2xl rounded-xl p-6 max-w-4xl w-full border border-gray-300 transform transition-all duration-500 hover:shadow-3xl">
        <img
          src={userImage!}
          alt="Profile picture"
          className="w-40 h-40 rounded-full border-4 border-indigo-600 shadow-lg transition-transform duration-300 hover:scale-110"
        />
        <div className="ml-8 flex flex-col justify-center">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-3">
            My Profile
          </h1>
          <p className="text-2xl text-gray-700 mb-3">
            Welcome, <span className="font-semibold">{user.username}</span>!
          </p>
          <div className="w-full border-t border-gray-300 my-4" />
          <p className="text-xl text-gray-600 mb-2">
            <strong>Email:</strong> {user.mail}
          </p>
          <p className="text-xl text-gray-600 mb-2">
            <strong>Joined on:</strong>{' '}
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <p
            className={`text-xl mb-4 ${user.active ? 'text-green-600' : 'text-red-600'}`}
          >
            <strong>Status:</strong> {user.active ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>
    </div>
  );
}

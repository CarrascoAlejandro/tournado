import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/lib/db'; // Asegúrate de importar la función para obtener el usuario

export default async function AccountPage() {
  const session = await auth();

  // Redirigir a la página de inicio de sesión si no hay sesión activa
  if (!session) {
    redirect('/login');
  }

  const userEmail = session.user?.email;
  const userImage = session.user?.image;

  // Obtener la información del usuario por correo
  const user = await getUserByEmail(userEmail!);
  if (!user) {
    return <p>Usuario no encontrado.</p>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-white p-8">
      <div className="flex bg-white shadow-xl rounded-lg p-6 max-w-4xl w-full border border-gray-200">
        <img
          src={userImage!}
          alt="Imagen de perfil"
          className="w-40 h-40 rounded-full border-4 border-indigo-600 shadow-lg transition-transform duration-300 hover:scale-110"
        />
        <div className="ml-6 flex flex-col justify-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">Mi Perfil</h1>
          <p className="text-2xl text-gray-700 mb-2">¡Bienvenido, <span className="font-semibold">{user.username}</span>!</p>
          <div className="w-full border-t border-gray-300 my-4" />
          <p className="text-xl text-gray-600 mb-1"><strong>Correo electrónico:</strong> {user.mail}</p>
          <p className="text-xl text-gray-600 mb-1"><strong>Fecha de creación:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
          <p className={`text-xl mb-4 ${user.active ? 'text-green-600' : 'text-red-600'}`}>
            <strong>Estado:</strong> {user.active ? 'Activo' : 'Desactivado'}
          </p>
        </div>
      </div>
    </div>
  );
}

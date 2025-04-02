import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <h2 className="text-2xl md:text-3xl font-medium text-gray-600 mt-4 mb-6">
        Síða fannst ekki
      </h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Síðan sem þú ert að leita að er ekki til eða hefur verið færð.
      </p>
      <Link 
        href="/"
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
      >
        Til baka á forsíðu
      </Link>
    </div>
  );
}

import Link from 'next/link';

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-red-500">403</h1>
      <h2 className="text-2xl md:text-3xl font-medium text-gray-600 mt-4 mb-6">
        Óheimilaður aðgangur
      </h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Þú hefur ekki heimild til að skoða þessa síðu. Vinsamlegast skráðu þig inn eða hafðu samband við umsjónarmann.
      </p>
      <div className="flex gap-4">
        <Link 
          href="/innskraning"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
        >
          Skrá inn
        </Link>
        <Link 
          href="/"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
        >
          Til baka á forsíðu
        </Link>
      </div>
    </div>
  );
}

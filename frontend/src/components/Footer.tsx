import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>© {currentYear} Verkefnalisti - Hópaverkefni Vefforritun 2</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/admin" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Stjórnborð
            </Link>
            <Link 
              href="/um-okkur" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Um okkur
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

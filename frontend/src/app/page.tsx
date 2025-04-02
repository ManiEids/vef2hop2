import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Verkefnalisti fyrir skilvirkari vinnubrögð
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Haltu utan um öll þín verkefni á einum stað. Skipuleggðu, flokkaðu og merktu verkefni til að auka skilvirkni.
          </p>
          <div className="space-x-4">
            <Link 
              href="/verkefni" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium"
            >
              Skoða verkefni
            </Link>
            <Link 
              href="/innskraning" 
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-6 py-3 rounded-md font-medium"
            >
              Skrá inn
            </Link>
          </div>
        </div>
        
        <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
          <Image 
            src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1472&q=80" 
            alt="Vinnuborð með tölvu og verkefnalista"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      </div>
      
      <div className="mt-20 grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Skipulagðu verkefni</h3>
          <p className="text-gray-600">
            Haltu utan um öll þín verkefni á einum stað með skýrum titlum og lýsingum.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Flokkaðu eftir efni</h3>
          <p className="text-gray-600">
            Notaðu flokka og merki til að halda verkefnum þínum skipulögðum og aðgengilegum.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Fylgstu með framvindu</h3>
          <p className="text-gray-600">
            Merktu verkefni sem lokið og fylgstu með framvindu verkefna þinna.
          </p>
        </div>
      </div>
    </div>
  );
}

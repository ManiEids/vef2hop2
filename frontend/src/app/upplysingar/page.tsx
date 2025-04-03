import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upplýsingar um Verkefnalista</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="relative h-64 w-full">
          <Image
            src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
            alt="Verkefnalisti mynd"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Verkefnalisti er smíðaður af Mána sem hluti af námskeiðinu Vefforritun 2 við Háskóla Íslands. 
            Verkefnið er unnið í Next.js og TypeScript með stuðningi við bakenda fyrir gögn eða möckuð gögn í staðinn.
          </p>
          
          <p className="text-gray-700 mb-4">
            Kerfið gerir notendum kleift að halda utan um verkefni, flokka þau, setja áherslur og fylgjast með framgangi.
          </p>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Eiginleikar:</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Verkefnalisti með stöðu verkefna</li>
              <li>Flokkun verkefna</li>
              <li>Myndir tengdar við verkefni</li>
              <li>Notendaumsjón með mismunandi aðgangsheimildum</li>
              <li>Mökkuð gögn ef bakendi er ekki tiltækur</li>
              <li>Fallegt notendaviðmót með dökkum ham</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Höfundur</h2>
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl font-bold text-gray-600">ME</span>
          </div>
          <div>
            <p className="font-medium">Máni Einarsson</p>
            <p className="text-gray-600">Hópaverkefni 2 - Vefforritun 2</p>
            <p className="text-gray-600">Háskóli Íslands</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Um Verkefnalista</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="relative h-64 w-full">
          <Image
            src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
            alt="Vinnuborð með skipulögðum verkefnum"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Verkefnalisti er öflug lausn til að halda utan um verkefni á skipulagðan og skilvirkan hátt. 
            Forritið gerir notendum kleift að búa til, breyta, eyða og merkja verkefni sem lokið, 
            auk þess að flokka þau eftir flokkum og merkjum (tags).
          </p>
          
          <p className="text-gray-700 mb-4">
            Verkefnið var unnið sem hluti af námskeiði í Vefforritun 2 við Háskóla Íslands árið 2025.
          </p>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Eiginleikar</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Skoða öll verkefni með síðuskiptingu</li>
              <li>Bæta við nýjum verkefnum með lýsingum og myndum</li>
              <li>Flokka verkefni í mismunandi flokka</li>
              <li>Merkja verkefni með merkjum (tags) til að auðvelda leit</li>
              <li>Innskráning notenda fyrir betri notendaupplifun</li>
              <li>Stjórnendaaðgangur með fleiri möguleikum</li>
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
            <p className="font-medium">Máni Eiðsson</p>
            <p className="text-gray-600">Nemandi í Vefforritun 2</p>
            <p className="text-gray-600">Háskóli Íslands, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}

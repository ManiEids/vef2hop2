import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Verkefnalisti
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, magna est convallis nunc, vel ultricies lorem nisl vel ligula.
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
            alt="Lorem ipsum"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      </div>
      
      <div className="mt-20 grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Lorem ipsum</h3>
          <p className="text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sed tellus sed lacus dapibus aliquet.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Lorem ipsum</h3>
          <p className="text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque consectetur sem at metus dignissim eleifend.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Lorem ipsum</h3>
          <p className="text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla egestas nisl vel purus malesuada elementum.
          </p>
        </div>
      </div>
    </div>
  );
}

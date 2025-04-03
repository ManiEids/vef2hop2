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
            alt="Lorem ipsum"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum volutpat nisl in nisi fermentum, id rutrum massa fermentum. 
            Cras auctor tristique ex, at dignissim erat blandit et. Curabitur tempor, felis sit amet ultrices consequat, enim risus semper nulla, 
            non tincidunt libero mi non nisl.
          </p>
          
          <p className="text-gray-700 mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sit amet mi vel lorem pulvinar dapibus.
          </p>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Lorem ipsum</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Lorem ipsum dolor sit amet</li>
              <li>Consectetur adipiscing elit</li>
              <li>Sed do eiusmod tempor incididunt</li>
              <li>Ut labore et dolore magna aliqua</li>
              <li>Ut enim ad minim veniam</li>
              <li>Quis nostrud exercitation ullamco</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Lorem ipsum</h2>
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl font-bold text-gray-600">ME</span>
          </div>
          <div>
            <p className="font-medium">Lorem ipsum</p>
            <p className="text-gray-600">Lorem ipsum dolor sit amet</p>
            <p className="text-gray-600">Consectetur adipiscing elit</p>
          </div>
        </div>
      </div>
    </div>
  );
}

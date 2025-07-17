import Image from "next/image";
import logo from "@/public/logo.png";
import Navbar from "@/components/ui/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen -mt-20">
      
      <div className="flex flex-col items-center justify-center gap-10 w-[500px] text-center">
        <h1 className="text-6xl text-blue-500 font-extrabold">
          Uptime Monitoring <span className="text-black underline italic">THAT SIMPLE</span>
        </h1>
        <p className="text-lg">
          Simple, reliable, and affordable uptime monitoring for your website or application.
        </p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Get Started
        </button>
      </div>
    </div>

  );
}

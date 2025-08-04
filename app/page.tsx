
import HomeAbout from "@/components/HomeAbout";
import PricingTable from "@/components/PricingTable";
import Navbar from "@/components/ui/Navbar";
import Link from "next/link";
import Script from "next/script";
import "tailwindcss-motion";
import Footer from "@/components/ui/Footer";


export default function Home() {
  return (
    <>
    
      <Navbar />
      <div className="flex flex-col items-center justify-center py-40 px-4 bg-gray-50">
        <div className="flex flex-col items-center justify-center gap-6 md:gap-10 max-w-md md:max-w-lg text-center">
          <h1 className="text-3xl md:text-6xl text-blue-500 font-extrabold motion-scale-in-[0.2] motion-translate-x-in-[-100%] motion-translate-y-in-[-1%] motion-rotate-in-[-130deg] motion-blur-in-[1px]">
            Add Automated Monitoring to Your Retainers.
          </h1>
          <p className="text-base md:text-xl text-gray-700">
            Uptyne is the freelancer's secret tool for creating bulletproof client service packages.
          </p>
          <Link
            href="/register"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Get Started For Free!
          </Link>
        </div>
      </div>
      <HomeAbout />

     <PricingTable />
     <Footer />
    </>
  );
}

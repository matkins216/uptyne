import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MobileNav from '@/components/MobileNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  console.log('Dashboard layout - User:', user, 'Error:', error);

  if (!user) {
    console.log(error);
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top navigation */}
      <MobileNav />
      
      <div className="flex h-full md:h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden md:block md:w-64 bg-white shadow-md">
          <div className="p-4 text-center">
            <h2 className="text-lg font-semibold">Uptime Monitor Dashboard</h2>
          </div>
          <nav className="mt-8">
            <ul>
              <li>
                <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100">Home</Link>
              </li>
              <li>
                <Link href="/dashboard/monitors" className="block px-4 py-2 hover:bg-gray-100">Monitors</Link>
              </li>
            </ul>
          </nav>
          <div className="p-4">
            <Link
              href="/logout"
              className="block w-full px-4 py-2 text-center bg-red-500 text-white rounded hover:bg-red-600"
            >
              Log Out
            </Link>
          </div>
        </aside>
        <main className="flex-grow p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
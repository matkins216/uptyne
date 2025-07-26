import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  console.log('Dashboard layout - User:', user, 'Error:', error);

  if (!user) {
    console.log(error);
    redirect('/login');
  }

  return (
    <div className="h-screen bg-gray-50">
      {/* Mobile top navigation */}
      <nav className="md:hidden bg-white shadow-md">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Uptime Monitor</h2>
          <div className="flex space-x-4">
            <Link href="/dashboard" className="px-3 py-2 hover:bg-gray-100 rounded">Home</Link>
            <Link href="/dashboard/monitors" className="px-3 py-2 hover:bg-gray-100 rounded">Monitors</Link>
            <Link href="/logout" className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600">Logout</Link>
          </div>
        </div>
      </nav>
      
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
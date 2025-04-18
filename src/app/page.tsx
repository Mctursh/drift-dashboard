import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <Dashboard />
    </main>
  );
}
// app/admin/page.tsx
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import AdminDashboard from './AdminDashboard';

export default async function Page() {
  return <AdminDashboard />;
}

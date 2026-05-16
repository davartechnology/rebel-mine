  <h1>SHEE MINE · Panneau de contrôle</h1>
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  const admin = await isAdmin()
  if (!admin) redirect('/')

  return <AdminDashboard />
}
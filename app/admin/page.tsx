import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  const admin = await isAdmin()
  if (!admin) redirect('/')

  return <AdminDashboard />
}
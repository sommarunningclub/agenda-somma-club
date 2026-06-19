import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login')
  }

  return (
    <div className="lg:flex min-h-[100dvh] bg-[#f3f4f7] text-[#1f2937]">
      <AdminSidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-5 py-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-8 lg:py-10 lg:pb-10">
          {children}
        </div>
      </main>
    </div>
  )
}

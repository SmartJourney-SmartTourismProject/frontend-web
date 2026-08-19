import { AppSidebar } from '@/components/app-shell/AppSidebar'

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AppSidebar />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}

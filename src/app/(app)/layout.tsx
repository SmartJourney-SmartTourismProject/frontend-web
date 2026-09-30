import { AppSidebar } from '@/components/shell/AppSidebar';
import { BackToSignInGuard } from '@/components/shell/BackToSignInGuard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <BackToSignInGuard />
      <AppSidebar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

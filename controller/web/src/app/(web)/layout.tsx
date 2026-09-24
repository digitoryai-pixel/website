import { WebShell } from '@/components/WebShell';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <WebShell>{children}</WebShell>;
}

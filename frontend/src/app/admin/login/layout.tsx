import { AuthProvider } from "@/hooks/useAuth";

// T120: Login page layout without sidebar
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

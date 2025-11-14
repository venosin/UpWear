import { AuthButton } from "@/components/auth-button";
import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white">
      <nav className="w-full flex justify-center border-b border-[#b5b6ad]/30 h-16">
        <div className="w-full max-w-7xl flex justify-between items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center font-semibold">
            <Link href="/" className="text-xl text-[#1a1b14]">
              UpWear
            </Link>
          </div>
          <AuthButton />
        </div>
      </nav>
      <div className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </main>
  );
}

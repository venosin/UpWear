import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome!</h1>
        <p className="text-gray-600 mt-2">This is a protected page - only authenticated users can see this.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h2 className="font-semibold text-blue-900 mb-2">Authentication Successful</h2>
        <p className="text-blue-800 text-sm">You are logged in and can access protected content.</p>
      </div>

      <div>
        <h2 className="font-semibold text-gray-900 mb-2">User Information</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Email: {data?.claims?.email || 'User email'}</p>
        </div>
      </div>
    </div>
  );
}

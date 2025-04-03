"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/app/components/logoutbutton";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  console.log("Session Data:", session); 

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (!session?.idToken) {
        setIsLoading(false);
        return;
      }
  
      try {
        const res = await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: session.idToken }),
        });
  
        const data = await res.json();
  
        if (data.success) {
          console.log("Token verification successful", data);
          router.push("/home"); // ✅ 成功時にリダイレクト
        } else {
          setError("Token verification failed");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };
  
    verifyToken();
  }, [session, router]);

  if (!session) {
    return <p>ログインが必要です。</p>;
  }

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return 
    <main className="flex flex-col items-center justify-center min-h-screen">
      <p>Verifying token...</p>
      <LogoutButton />
    </main>
}

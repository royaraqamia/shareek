import { LoginClient } from "./LoginClient";

export default function LoginPage() {
  return (
    <main className="min-h-screen relative flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <img
        src="/auth_background.png"
        alt="Background"
        className="w-full h-full object-cover -z-10 absolute inset-0 opacity-15"
      />
      <LoginClient />
    </main>
  );
}

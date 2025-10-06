import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6">
      <LoginForm />
    </main>
  );
}

import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100dvh-0px)] w-full grid place-items-center p-6">
      <LoginForm className="w-full max-w-sm" />
    </main>
  );
}



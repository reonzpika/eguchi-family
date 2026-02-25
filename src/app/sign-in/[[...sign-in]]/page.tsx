import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-warm px-6 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo and branding */}
        <div className="space-y-4">
          <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-3xl bg-primary text-3xl shadow-lg">
            🌸
          </div>
          <h1 className="text-[26px] font-extrabold text-foreground">
            江口ファミリーハブ
          </h1>
          <p className="text-sm text-muted">
            家族のプライベートワークスペース
          </p>
        </div>

        {/* Clerk SignIn component */}
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

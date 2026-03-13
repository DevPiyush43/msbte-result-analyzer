"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Lock, Mail } from "lucide-react";

import { useAuth } from "@/components/AuthProvider";
import { FadeIn, HoverLift } from "@/components/Animated";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      await login({ username: values.username, password: values.password });
      router.push("/dashboard");
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || "Login failed";
      setError("root", { message });
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login-bg.png')" }}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
      
      <div className="relative z-10 w-full max-w-md">
        <FadeIn>
          <div className="mb-8 text-center bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">
              Academy Management
            </h1>
            <p className="mt-2 text-slate-100 font-medium">MSBTE Result Portal</p>
          </div>
        </FadeIn>

        <HoverLift>
          <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="text-xl font-bold text-slate-800 tracking-tight">System Login</div>
              <div className="text-sm text-slate-500 font-medium italic">Authorize to access dashboard</div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Username</label>
                  <div className="relative">
                    <GraduationCap className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      placeholder="Enter your username" 
                      {...register("username")} 
                    />
                  </div>
                  {errors.username?.message ? <p className="text-sm text-red-600 ml-1">{errors.username.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      type="password" 
                      placeholder="••••••••" 
                      {...register("password")} 
                    />
                  </div>
                  {errors.password?.message ? <p className="text-sm text-red-600 ml-1">{errors.password.message}</p> : null}
                </div>

                {errors.root?.message ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm text-center font-medium">
                    {errors.root.message}
                  </div>
                ) : null}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-blue-700 hover:bg-blue-800 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Authenticating..." : "Login to System"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </HoverLift>

        <FadeIn delay={0.08}>
          <div className="mt-8 text-center">
            <Link className="px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-medium backdrop-blur-md transition-all border border-white/10" href="/">
              ← Home Page
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

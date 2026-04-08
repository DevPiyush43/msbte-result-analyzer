"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Lock, Mail, AlertCircle, RefreshCw } from "lucide-react";

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
      const message =
        err?.response?.data?.error?.message ||
        "Invalid credentials. Please check your username and password.";
      setError("root", { message });
    }
  }

  function clearError() {
    setError("root", { message: undefined });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[50rem] w-[50rem] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-secondary/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <FadeIn>
          <div className="mb-10 text-center space-y-4">
             <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white border border-border shadow-xl mb-2">
                <GraduationCap className="h-8 w-8 text-primary" />
             </div>
             <div className="space-y-1">
                <h1 className="text-4xl font-display font-black tracking-tight text-foreground">
                   MSBTE Result Analyzer
                </h1>
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Teacher Login Portal</p>
             </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="border-border shadow-2xl bg-white/80 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="text-center pt-12 pb-6">
              <div className="text-lg font-display font-black text-foreground tracking-tight uppercase tracking-[0.1em]">Authentication</div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 mt-1">Access your teacher dashboard</div>
            </CardHeader>
            <CardContent className="px-10 pb-12">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Username</label>
                  <div className="relative group">
                    <div className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <Input 
                      className="pl-12 h-14 bg-accent/20 border-border text-foreground font-bold rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all placeholder:text-muted-foreground/30" 
                      placeholder="Username" 
                      {...register("username")} 
                    />
                  </div>
                  {errors.username?.message ? <p className="text-[10px] font-bold text-rose-500 ml-2 uppercase tracking-widest text-xs">{errors.username.message}</p> : null}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Password</label>
                  <div className="relative group">
                    <div className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <Input 
                      className="pl-12 h-14 bg-accent/20 border-border text-foreground font-bold rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all placeholder:text-muted-foreground/30" 
                      type="password" 
                      placeholder="••••••••" 
                      {...register("password")} 
                    />
                  </div>
                  {errors.password?.message ? <p className="text-[10px] font-bold text-rose-500 ml-2 uppercase tracking-widest text-xs">{errors.password.message}</p> : null}
                </div>

                {errors.root?.message ? (
                  <FadeIn>
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-center animate-shake shadow-sm">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                        <span>{errors.root.message}</span>
                      </div>
                      <button
                        type="button"
                        onClick={clearError}
                        className="inline-flex items-center gap-2 mt-1 px-5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-600 text-[10px] font-black uppercase tracking-widest transition-all border border-rose-200"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Re-enter Credentials
                      </button>
                    </div>
                  </FadeIn>
                ) : null}

                <Button 
                  type="submit" 
                  className="w-full h-14 text-[11px] font-black uppercase tracking-[0.2em] bg-primary text-white hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all duration-300 rounded-2xl active:scale-[0.98]" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-10 text-center">
            <Link className="px-8 py-3 rounded-2xl bg-white border border-border hover:bg-accent text-muted-foreground hover:text-foreground text-[9px] font-bold uppercase tracking-widest transition-all shadow-sm" href="/">
              ← Return Home
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

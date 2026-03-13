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
      const message = err?.response?.data?.error?.message || "Internal auth system failure";
      setError("root", { message });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0a] relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[50rem] w-[50rem] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <FadeIn>
          <div className="mb-10 text-center space-y-4">
             <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl mb-2">
                <GraduationCap className="h-8 w-8 text-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
             </div>
             <div className="space-y-1">
                <h1 className="text-4xl font-display font-black tracking-tight text-white">
                  Quantumsync
                </h1>
                <p className="text-[10px] uppercase font-black tracking-[0.4em] text-muted-foreground opacity-50">Advanced Academic Result Node</p>
             </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.3)] bg-white/5 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="text-center pt-10 pb-6">
              <div className="text-lg font-display font-black text-white tracking-tight uppercase tracking-[0.1em]">Authenticator</div>
              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40 mt-1 italic">Secure Administrative Handshake</div>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Access Identifier</label>
                  <div className="relative group">
                    <div className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input 
                      className="pl-12 h-14 bg-white/[0.03] border-white/10 text-white font-bold rounded-2xl focus:ring-4 focus:ring-primary/20 focus:bg-white/[0.05] transition-all placeholder:text-white/10" 
                      placeholder="Operator ID" 
                      {...register("username")} 
                    />
                  </div>
                  {errors.username?.message ? <p className="text-[10px] font-black text-rose-500 ml-2 uppercase tracking-wider">{errors.username.message}</p> : null}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Security Cipher</label>
                  <div className="relative group">
                    <div className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input 
                      className="pl-12 h-14 bg-white/[0.03] border-white/10 text-white font-bold rounded-2xl focus:ring-4 focus:ring-primary/20 focus:bg-white/[0.05] transition-all placeholder:text-white/10" 
                      type="password" 
                      placeholder="••••••••" 
                      {...register("password")} 
                    />
                  </div>
                  {errors.password?.message ? <p className="text-[10px] font-black text-rose-500 ml-2 uppercase tracking-wider">{errors.password.message}</p> : null}
                </div>

                {errors.root?.message ? (
                  <FadeIn>
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                      {errors.root.message}
                    </div>
                  </FadeIn>
                ) : null}

                <Button 
                  type="submit" 
                  className="w-full h-14 text-[10px] font-black uppercase tracking-[0.2em] bg-white text-black hover:bg-primary hover:text-white shadow-2xl transition-all duration-300 rounded-2xl active:scale-[0.98]" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Syncing Identity..." : "Initiate Protocol"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-10 text-center">
            <Link className="px-8 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-[9px] font-black uppercase tracking-[0.3em] backdrop-blur-md transition-all border border-white/5" href="/">
              ← Return Home
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Try to login with Magic Link
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        });

        if (error) {
            setMessage({ type: "error", text: error.message });
            setLoading(false);
        } else {
            setMessage({ type: "success", text: "Check your email for the login link!" });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
            {/* Background Effect */}
            <div className="absolute inset-0 z-0 h-full w-full bg-background [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] opacity-20"></div>

            <div className="w-full max-w-md p-4 z-10">
                <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        <ShieldCheck className="w-6 h-6" />
                        <span className="text-xl">Ad Policy Validator</span>
                    </div>
                </div>

                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Sign In</CardTitle>
                        <CardDescription className="text-center">
                            Enter your email to receive a magic link
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Send Magic Link
                            </Button>
                            {message && (
                                <div className={`p-3 rounded-md text-sm text-center ${message.type === 'error' ? 'bg-destructive/15 text-destructive' : 'bg-green-500/15 text-green-500'}`}>
                                    {message.text}
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

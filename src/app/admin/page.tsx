"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // We need to create this or use standard input
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const [key, setKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            // TODO: Add real admin check here (e.g. user.email === 'admin@burla.com')
            setIsAdmin(true);
        };
        checkUser();
    }, [router, supabase]);

    const handleSave = async () => {
        setLoading(true);
        // Save to Supabase 'settings' table
        // Table schema expected: settings (key text primary key, value text)
        // We'll use a fixed key 'openai_api_key'
        const { error } = await supabase
            .from('settings')
            .upsert({ key: 'openai_api_key', value: key });

        if (error) {
            alert("Error saving key: " + error.message);
        } else {
            alert("API Key saved successfully!");
            setKey("");
        }
        setLoading(false);
    };

    if (!isAdmin) return null;

    return (
        <div className="container mx-auto px-4 py-20 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Admin Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">OpenAI API Key</label>
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="sk-..."
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        <p className="text-xs text-muted-foreground">
                            This key will be used for all client analyses.
                        </p>
                    </div>
                    <Button onClick={handleSave} disabled={loading || !key}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        <Save className="w-4 h-4 mr-2" />
                        Update Key
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

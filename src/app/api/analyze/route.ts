import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `
You are an expert Ad Policy Compliance Officer for Google Ads and Meta Ads.
Analyze the provided ad creative (frames + transcript).

Focus on:
1. **Personal Health**: Zooming in on body parts, before/after images, pointing to pain points, "cures".
2. **Sexual Content**: Nudity, suggestive poses, excessive skin.
3. **Misleading Claims**: "Easy money", "Instant weight loss", "Cure in X days".
4. **Shocking Content**: Graphic imagery, blood.
5. **Brand Assets**: Fake buttons.

Input provided:
- Audio Transcript (from Whisper)
- Visual Frames (sampled from video)

Return JSON:
{
  "status": "approved" | "rejected" | "warning",
  "risk_score": number (0-100),
  "platforms": {
    "google": { "status": "approved"|"rejected"|"limited", "reasons": [] },
    "meta": { "status": "approved"|"rejected"|"limited", "reasons": [] }
  },
  "details": {
    "visual_triggers": [],
    "audio_triggers": [],
    "overall_feedback": ""
  }
}
`;

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        // Check Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch API Key from DB (Settings table) or Env
        let apiKey = process.env.OPENAI_API_KEY;
        const { data: settings } = await supabase.from('settings').select('value').eq('key', 'openai_api_key').single();
        if (settings?.value) {
            apiKey = settings.value;
        }

        if (!apiKey) {
            return NextResponse.json({ error: "Configuration Error: No OpenAI API Key found. Please set it in Admin Dashboard." }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey });

        const formData = await req.formData();
        const file = formData.get("file") as File; // The video file (for Whisper)
        const framesJson = formData.get("frames") as string; // The extracted frames (Base64)

        if (!file || !framesJson) {
            return NextResponse.json({ error: "Missing file or frames" }, { status: 400 });
        }

        const frames = JSON.parse(framesJson) as string[];

        // 1. Audio Transcription (Whisper)
        // We need to send a File-like object to OpenAI. 'file' is valid.
        let transcript = "";
        try {
            const transcription = await openai.audio.transcriptions.create({
                file: file,
                model: "whisper-1",
            });
            transcript = transcription.text;
        } catch (e) {
            console.error("Whisper error:", e);
            transcript = "[Audio Transcription Failed or No Audio]";
        }

        // 2. Vision Analysis (GPT-4o)
        const content: any[] = [
            { type: "text", text: `Analyze this ad.\n**Transcript**: ${transcript}` }
        ];

        // Add frames (take up to 10 to avoid payload limits/cost)
        frames.slice(0, 10).forEach(frame => {
            content.push({
                type: "image_url",
                image_url: {
                    url: `data:image/jpeg;base64,${frame}`,
                    detail: "low"
                }
            });
        });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: content }
            ],
            response_format: { type: "json_object" },
            max_tokens: 1000,
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}");

        // 3. Save to Supabase History
        const { error: dbError } = await supabase.from("analyses").insert({
            user_id: user.id,
            filename: file.name,
            result: result,
            risk_score: result.risk_score,
            status: result.status
        });

        if (dbError) console.error("DB Save Error:", dbError);

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Analysis Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

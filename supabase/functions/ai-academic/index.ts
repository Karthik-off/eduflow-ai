import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    // Validate caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: claimsErr } = await callerClient.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { type, studentName, subjectName, marksObtained, maxMarks, examType } = await req.json();

    if (type === 'recovery_suggestion') {
      const percentage = (marksObtained / maxMarks) * 100;
      const prompt = `A student named ${studentName} scored ${marksObtained}/${maxMarks} (${percentage.toFixed(1)}%) in ${examType} for ${subjectName}. This is below passing threshold. 

Provide a brief, actionable academic recovery plan with:
1. 2-3 specific study strategies for this subject
2. 2-3 recommended YouTube search queries for learning ${subjectName} topics
3. A short motivational note

Keep it concise and practical. Format as JSON with keys: strategies (array of strings), youtubeQueries (array of strings), motivation (string).`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are an academic advisor AI. Always respond with valid JSON only, no markdown." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!aiResponse.ok) {
        const status = aiResponse.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded, try again later" }), {
            status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
            status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw new Error("AI gateway error");
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content ?? '';
      
      // Try to parse JSON from the response
      let parsed;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { strategies: [], youtubeQueries: [], motivation: content };
      } catch {
        parsed = { strategies: [content], youtubeQueries: [], motivation: '' };
      }

      return new Response(JSON.stringify(parsed), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'parent_reminder') {
      const { studentNames, subject, dueType } = await req.json();
      const prompt = `Generate a brief, professional SMS/notification message to parents about their child's academic status. 
Students: ${(studentNames as string[]).join(', ')}
Subject: ${subject}
Issue: ${dueType}
Keep it under 160 characters, professional and non-alarming.`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: "You are a school communication assistant. Return only the message text." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!aiResponse.ok) throw new Error("AI gateway error");
      const aiData = await aiResponse.json();
      const message = aiData.choices?.[0]?.message?.content ?? '';

      return new Response(JSON.stringify({ message: message.trim() }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid type' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

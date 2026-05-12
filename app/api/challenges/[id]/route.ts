import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data: challenge, error } = await supabase
    .from("challenges")
    .select("id,title,description,cipher_type,ciphertext,points,difficulty,hints,active")
    .eq("id", params.id)
    .single();

  if (error || !challenge) {
    return NextResponse.json(
      { error: "Challenge not found" },
      { status: 404 }
    );
  }

  const { data: finalChallenge } = await supabase
    .from("challenges")
    .select("id")
    .eq("active", true)
    .order("points", { ascending: false })
    .limit(1)
    .maybeSingle();

  const is_final = finalChallenge?.id === params.id

  // Check if already solved
  const { data: solved } = await supabase
    .from("submissions")
    .select("id")
    .eq("user_id", user.id)
    .eq("challenge_id", params.id)
    .eq("correct", true)
    .maybeSingle();

  // Get attempt count
  const { data: attempt } = await supabase
    .from("challenge_attempts")
    .select("attempt_count, cooldown_until")
    .eq("user_id", user.id)
    .eq("challenge_id", params.id)
    .maybeSingle();

  return NextResponse.json({
    ...challenge,
    solved: !!solved,
    attempts: attempt?.attempt_count || 0,
    cooldown_until: attempt?.cooldown_until,
    is_final,
  });
}
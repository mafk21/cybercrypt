import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabase();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const { data: challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", params.id)
    .single();

  const { data: existing } = await supabase
    .from("submissions")
    .select("*")
    .eq("user_id", user.id)
    .eq("challenge_id", params.id)
    .eq("correct", true)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      error: "Already solved"
    });
  }

  // Check cooldown
  const { data: attempt } = await supabase
    .from("challenge_attempts")
    .select("*")
    .eq("user_id", user.id)
    .eq("challenge_id", params.id)
    .maybeSingle();

  const now = new Date();
  if (attempt?.cooldown_until && new Date(attempt.cooldown_until) > now) {
    const remaining = Math.ceil((new Date(attempt.cooldown_until).getTime() - now.getTime()) / 1000);
    return NextResponse.json({
      cooldown: remaining
    });
  }

  const attemptCount = (attempt?.attempt_count || 0) + 1;
  let cooldownSeconds = 0;

  if (attemptCount >= 5) {
    cooldownSeconds = 120;
  } else if (attemptCount >= 3) {
    cooldownSeconds = 30;
  }

  const correct =
    body.answer.trim().toLowerCase() ===
    challenge.solution.toLowerCase();

  await supabase.from("submissions").insert({
    user_id: user.id,
    challenge_id: params.id,
    answer: body.answer,
    correct,
    points_awarded: correct ? challenge.points : 0,
    submitted_at: now.toISOString()
  });

  // Update attempts
  const cooldownUntil = cooldownSeconds > 0 ? new Date(now.getTime() + cooldownSeconds * 1000).toISOString() : null;

  if (attempt) {
    await supabase
      .from("challenge_attempts")
      .update({
        attempt_count: attemptCount,
        last_attempt_at: now.toISOString(),
        cooldown_until: cooldownUntil
      })
      .eq("id", attempt.id);
  } else {
    await supabase
      .from("challenge_attempts")
      .insert({
        user_id: user.id,
        challenge_id: params.id,
        attempt_count: attemptCount,
        last_attempt_at: now.toISOString(),
        cooldown_until: cooldownUntil
      });
  }

  if (correct) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", user.id)
      .single();

    await supabase
      .from("profiles")
      .update({
        points: (profile?.points || 0) + challenge.points
      })
      .eq("id", user.id);
  }

  return NextResponse.json({
    correct,
    cooldown: cooldownSeconds > 0 ? cooldownSeconds : undefined
  });
}
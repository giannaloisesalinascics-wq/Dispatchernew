import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: "Missing Service Role Key configuration" }, { status: 401 });
  
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "Missing User ID" }, { status: 400 });

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
  
  // Update internal metadata to grant dispatcher permissions
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
     user_metadata: { role: 'dispatcher' }
  });
  
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });
  
  // Try to cleanly sync the user_profiles row as well
  await supabaseAdmin.from('user_profiles').update({ role: 'dispatcher' }).eq('auth_user_id', userId);

  return NextResponse.json({ success: true });
}

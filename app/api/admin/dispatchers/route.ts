import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: "Missing Service Role Key configuration" }, { status: 401 });
  
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
  
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  const pendingUsers = data.users.filter(u => u.user_metadata?.role === 'pending_dispatcher');
  return NextResponse.json(pendingUsers);
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("id");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !userId) return NextResponse.json({ error: "Missing requirements" }, { status: 400 });
  
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

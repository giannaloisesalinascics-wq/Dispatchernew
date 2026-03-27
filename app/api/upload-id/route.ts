import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return NextResponse.json({ error: "Missing Service Role Key configuration" }, { status: 401 });

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;

    if (!file || !fileName) {
      return NextResponse.json({ error: "Missing file or filename payload" }, { status: 400 });
    }

    // Convert to ArrayBuffer -> Node Buffer for safe transit
    const arrayBuffer = await file.arrayBuffer();
    const safeBuffer = Buffer.from(arrayBuffer);

    // Bypass RLS completely via backend service role key injection
    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(fileName, safeBuffer, {
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, fileName });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error during upload" }, { status: 500 });
  }
}

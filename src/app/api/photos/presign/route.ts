import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !["frontliner", "admin_hr"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const key = `candidates/${crypto.randomUUID()}.jpg`;

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: "image/jpeg",
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 });
  const objectUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

  return NextResponse.json({ uploadUrl, objectUrl });
}

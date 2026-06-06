import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Try pg approach first
    const dbPassword = process.env.SUPABASE_DB_PASSWORD;
    if (dbPassword) {
      try {
        const { Client } = await import('pg');
        const projectRef = 'azpvtdhqvfksefuwfueb';
        const client = new Client({
          host: 'aws-0-ap-southeast-1.pooler.supabase.com',
          port: 6543,
          database: 'postgres',
          user: `postgres.${projectRef}`,
          password: dbPassword,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 15000,
        });
        await client.connect();
        await client.query('ALTER TABLE questions ADD COLUMN IF NOT EXISTS image_url TEXT;');
        await client.end();
        return NextResponse.json({ success: true, message: '✅ Column added via pg' });
      } catch (pgErr: any) {
        return NextResponse.json({ error: `pg failed: ${pgErr.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({
      error: 'Missing DB password. Add it via: vercel env add SUPABASE_DB_PASSWORD',
      hint: 'Get it from Supabase Dashboard → Project Settings → Database → Connection string > Password'
    }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

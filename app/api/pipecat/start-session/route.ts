// app/api/start-session/route.ts  (or /pages/api/start-session.ts in pages router)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!process.env.PCC_PUBLIC_KEY) throw new Error('Missing PCC_PUBLIC_KEY');
  if (!process.env.PCC_AGENT) throw new Error('Missing PCC_AGENT');

  const res = await fetch(
    `https://api.pipecat.daily.co/v1/public/${process.env.PCC_AGENT}/start`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PCC_PUBLIC_KEY}`,
      },
      body: JSON.stringify({
        createDailyRoom: true,
        dailyRoomProperties: {},
        body,
      }),
      // **IMPORTANT**: revalidate:"no-store" prevents caching in Next.js
      cache: 'no-store',
      next: {
        revalidate: 0,
      },
    }
  );

  if (!res.ok) {
    console.error('Pipecat start error', await res.text());
    return NextResponse.json({ error: 'start_failed' }, { status: 502 });
  }

  const { dailyRoom, dailyToken } = await res.json();
  return NextResponse.json({ room_url: dailyRoom, token: dailyToken });
}

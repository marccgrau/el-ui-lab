/* app/page.tsx  (or pages/index.tsx if you’re on the Pages router) */
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function Home() {
  /* ────────────────────────────────────────────────────────────────
     ①  Read query-string params on the first render
  ───────────────────────────────────────────────────────────────── */
  const params = useSearchParams();

  const prolificPid = params.get('PROLIFIC_PID');
  const adviceCondition = params.get('ADVICE_CONDITION');
  const emotionCondition = params.get('EMOTION_CONDITION');
  const scenarioCondition = params.get('SCENARIO_CONDITION');

  /* ────────────────────────────────────────────────────────────────
     ②  Stash them in sessionStorage (once)
  ───────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (prolificPid) sessionStorage.setItem('PROLIFIC_PID', prolificPid);
    if (adviceCondition)
      sessionStorage.setItem('ADVICE_CONDITION', adviceCondition);
    if (emotionCondition)
      sessionStorage.setItem('EMOTION_CONDITION', emotionCondition);
    if (scenarioCondition)
      sessionStorage.setItem('SCENARIO_CONDITION', scenarioCondition);
  }, [prolificPid, adviceCondition, emotionCondition, scenarioCondition]);

  /* ────────────────────────────────────────────────────────────────
     ③  Decide where the “Continue” button should lead
  ───────────────────────────────────────────────────────────────── */
  const nextHref = '/hardware-check';

  /* ──────────────────────────────────────────────────────────────── */
  return (
    <main className='flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center'>
      <section className='max-w-lg space-y-4'>
        <h1 className='text-3xl font-bold'>Welcome to the Experiment</h1>

        <p>
          Thank you for participating! <br></br>
          You will take on the role of a&nbsp;
          <strong>customer service agent</strong> and conduct a live call with a
          customer.
        </p>

        <p>
          The next screen will walk you through a short tutorial explaining on
          how the platform works and what is expected of you.
        </p>
      </section>

      <Button asChild size='lg' className='px-10'>
        <Link href={nextHref}>Continue to hardware check and tutorial</Link>
      </Button>
    </main>
  );
}

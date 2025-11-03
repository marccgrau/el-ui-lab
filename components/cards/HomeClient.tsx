/* app/page.tsx (or pages/index.tsx) */
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, Info } from 'lucide-react';

export default function Home() {
  /* ────────────────────────────────────────────────────────────────
     ①  Read query-string params on the first render
  ───────────────────────────────────────────────────────────────── */
  const params = useSearchParams();

  const prolificPid = params.get('PROLIFIC_PID');
  const civilityMode = params.get('CIVILITY_MODE');
  const adviceCondition = params.get('ADVICE_CONDITION');
  const scenarioCondition = params.get('SCENARIO');

  /* ────────────────────────────────────────────────────────────────
     ②  Stash them in sessionStorage (once)
  ───────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (prolificPid) sessionStorage.setItem('PROLIFIC_PID', prolificPid);
    if (adviceCondition)
      sessionStorage.setItem('ADVICE_CONDITION', adviceCondition);
    if (civilityMode) sessionStorage.setItem('CIVILITY_MODE', civilityMode);
    if (scenarioCondition)
      sessionStorage.setItem('SCENARIO', scenarioCondition);
  }, [prolificPid, adviceCondition, civilityMode, scenarioCondition]);

  /* ────────────────────────────────────────────────────────────────
     ③  Decide where the “Continue” button should lead
  ───────────────────────────────────────────────────────────────── */
  const nextHref = '/hardware-check';

  return (
    <main className='relative min-h-screen w-full bg-gradient-to-b from-background to-muted/40'>
      <div className='mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-24 pt-10 sm:gap-8 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='flex items-center gap-3'>
          <div>
            <h1 className='text-2xl font-semibold leading-tight sm:text-3xl'>
              Welcome to the Experiment
            </h1>
            <p className='text-sm text-muted-foreground sm:text-base'>
              You will act as a{' '}
              <span className='font-medium text-foreground'>
                customer service agent
              </span>{' '}
              in a short live call.
            </p>
          </div>
        </div>

        <Card className='shadow-sm'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-xl'>Your Task</CardTitle>
            <CardDescription>
              Complete a customer call while meeting our service expectations.
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* Requirements */}
            <section className='space-y-3'>
              <h2 className='text-base font-semibold tracking-tight'>
                Requirements
              </h2>
              <ul className='grid gap-2 text-sm leading-relaxed text-muted-foreground sm:grid-cols-1'>
                <li className='flex items-start gap-2'>
                  <CheckCircle2
                    className='mt-0.5 h-4 w-4 text-primary'
                    aria-hidden
                  />
                  Join a live call with a customer.
                </li>
                <li className='flex items-start gap-2'>
                  <CheckCircle2
                    className='mt-0.5 h-4 w-4 text-primary'
                    aria-hidden
                  />
                  Resolve the customer request as accurately as you can.
                </li>
                <li className='flex items-start gap-2'>
                  <CheckCircle2
                    className='mt-0.5 h-4 w-4 text-primary'
                    aria-hidden
                  />
                  Follow the display rule below throughout the call.
                </li>
              </ul>
            </section>

            <Separator />

            {/* Expected behavior (display rule) — always visible */}
            <div className='rounded-xl border bg-muted/30 p-4'>
              <p className='mb-1 text-sm font-semibold text-foreground'>
                Expected behavior (display rule)
              </p>
              <p className='text-sm leading-relaxed text-muted-foreground'>
                This is a customer service job, and our organization has a
                climate of enthusiasm and friendliness. You will be evaluated on
                your ability to be outgoing, enthusiastic, and show positive
                emotion to your customers. It is important that you do the task
                well and express friendliness, warmth, and enthusiasm. Some
                customer service organizations demand their employees provide
                “service with a smile” despite circumstances—this is the
                requirement here, as well. Our organization and its customers
                value employees being very friendly and outgoing. Our motto is
                “putting a smile on your face will put the smile in your voice!”
                For quality service, if you have any negative feelings or
                reactions, please try not to let those feelings show; instead
                always be friendly, enthusiastic, and show positive emotion
                despite circumstances. If you get irritated or stressed, do not
                let it show—put on a smile and be friendly. We are interested
                not only in how correctly you do the tasks, but also in your
                ability to express friendliness and enthusiasm.
              </p>
            </div>

            <Separator />

            {/* Bonus info */}
            <Alert
              variant='default'
              className='border border-green-200 bg-green-50'
            >
              <AlertTitle className='text-green-700'>
                Bonus available
              </AlertTitle>
              <AlertDescription className='text-sm text-green-700'>
                If you fulfill all requirements successfully, you will receive a
                bonus of <span className='font-semibold'>CHF 5</span>
              </AlertDescription>
            </Alert>

            <Separator />

            {/* Tutorial note */}
            <Alert>
              <Info className='h-4 w-4' />
              <AlertTitle>Next step</AlertTitle>
              <AlertDescription className='text-sm'>
                The next screen will guide you through a quick hardware check
                and a short tutorial on how the platform works and what is
                expected of you.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Sticky footer action */}
        <div className='sticky bottom-0 -mx-4 flex items-center justify-center bg-gradient-to-t from-background/80 to-transparent px-4 py-6 backdrop-blur-sm sm:-mx-6 lg:-mx-8'>
          <Button asChild size='lg' className='px-8'>
            <Link href={nextHref}>Continue to hardware check & tutorial</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

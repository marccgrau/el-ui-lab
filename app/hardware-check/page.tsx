/* app/hardware-check/page.tsx */
'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/* ---------- microphone hook --------------------------------- */
function useMicVolume() {
  const [level, setLevel] = useState(0); // 0 … 1, -1 = error
  const raf = useRef<number | undefined>(undefined);
  const stream = useRef<MediaStream | null>(null);

  useEffect(() => {
    let ctx: AudioContext, analyser: AnalyserNode;

    (async () => {
      try {
        stream.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        ctx = new AudioContext();
        analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        ctx.createMediaStreamSource(stream.current).connect(analyser);

        const data = new Uint8Array(analyser.fftSize);

        const tick = () => {
          analyser.getByteTimeDomainData(data);

          /* --- PEAK-based level, then gentle smoothing -------- */
          const peak = Math.max(...data.map((v) => Math.abs(v - 128))) / 128; // 0 … ~0.4
          const target = Math.min(1, peak * 2.5); // 2.5 ≈ “normal speech → 5–6 bars”
          setLevel((prev) => prev * 0.7 + target * 0.3); // 30 % new, 70 % old

          raf.current = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        setLevel(-1); // permission denied / no mic
      }
    })();

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      stream.current?.getTracks().forEach((t) => t.stop());
      ctx?.close();
    };
  }, []);

  return level;
}

/* ---------- sub-components ---------------------------------- */
function MicTest() {
  const level = useMicVolume();

  const bars = useMemo(() => {
    const total = 10;
    const active = Math.round(level * total);
    return Array.from({ length: total }, (_, i) => i < active);
  }, [level]);

  return (
    <div className='flex flex-col items-center gap-4'>
      <p className='font-medium'>Microphone level</p>

      {level >= 0 ? (
        <div className='flex items-end gap-1 h-16'>
          {bars.map((on, i) => (
            <div
              key={i}
              className={`w-2 rounded-sm transition-colors ${
                on ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
              }`}
              style={{ height: `${(i + 1) * 8}px` }}
            />
          ))}
        </div>
      ) : (
        <p className='text-red-600 text-sm'>
          Unable to access your microphone. Please grant permission and reload.
        </p>
      )}
    </div>
  );
}

function SpeakerTest() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => null);
      setPlaying(true);
    }
  };

  return (
    <div className='flex flex-col items-center gap-4'>
      <p className='font-medium'>Speaker test</p>
      <Button onClick={toggle}>{playing ? 'Stop' : 'Play test sound'}</Button>
      <audio
        ref={audioRef}
        src='https://tgd0vtaejsyqnrno.public.blob.vercel-storage.com/audio_working.wav'
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}

/* ---------- page -------------------------------------------- */
export default function HardwareCheckPage() {
  const [adviceCondition, setAdviceCondition] = useState<string | null>(null);

  /* we still route to the correct tutorial variant ------------- */
  useEffect(() => {
    setAdviceCondition(sessionStorage.getItem('ADVICE_CONDITION'));
  }, []);

  const nextHref = useMemo(
    () =>
      adviceCondition?.toLowerCase() === 'noadvice'
        ? '/tutorial-no-advice'
        : '/tutorial-advice',
    [adviceCondition]
  );

  return (
    <main className='flex min-h-screen items-center justify-center px-4'>
      <Card className='w-full max-w-3xl'>
        <CardHeader>
          <CardTitle>Audio &amp; Microphone Check</CardTitle>
          <CardDescription>
            Follow these steps to make sure your setup is ready:
            <ol className='list-decimal pl-4 mt-2 space-y-1 text-sm'>
              <li>
                When the browser asks for microphone access, click{' '}
                <strong>Allow</strong>.
              </li>
              <li>
                Say “testing one two” – <strong> green bars</strong> should
                light up.
              </li>
              <li>
                Click <em>Play test sound</em>; you should hear a short
                confirmation.
              </li>
              <li>
                If both work, hit <strong>All set – continue</strong>.
              </li>
            </ol>
          </CardDescription>
        </CardHeader>

        <CardContent className='grid gap-10'>
          <MicTest />
          <SpeakerTest />
          <Button asChild size='lg' className='px-10'>
            <Link href={nextHref}>All&nbsp;set – continue</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

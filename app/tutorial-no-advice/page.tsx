// app/tutorial-advice/VideoGate.tsx
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

const VIDEO_URL =
  'https://tgd0vtaejsyqnrno.public.blob.vercel-storage.com/tutorial-noadvice.mov';

export default function VideoGate() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [maxWatched, setMaxWatched] = useState(0); // farthest legitimate time
  const [finished, setFinished] = useState(false);
  const [playing, setPlaying] = useState(false); // start paused

  /* ────────────────────────────────────────────────────────────────
     ①  Track legitimate progress
  ───────────────────────────────────────────────────────────────── */
  const handleTimeUpdate = () => {
    const t = videoRef.current!.currentTime;
    setMaxWatched((prev) => (t > prev ? t : prev));
  };

  /* ────────────────────────────────────────────────────────────────
     ②  Block fast-forwarding
  ───────────────────────────────────────────────────────────────── */
  const handleSeeking = () => {
    const attempted = videoRef.current!.currentTime;
    if (attempted > maxWatched + 1) {
      // 1-second grace
      videoRef.current!.currentTime = maxWatched; // snap back
    }
  };

  /* ────────────────────────────────────────────────────────────────
     ③  Toggle play / pause
  ───────────────────────────────────────────────────────────────── */
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  }, []);

  /* ────────────────────────────────────────────────────────────────
     ④  Mark completion
  ───────────────────────────────────────────────────────────────── */
  const handleEnded = () => {
    setFinished(true);
    setPlaying(false);
  };

  /* ────────────────────────────────────────────────────────────────
     ⑤  (Optional) persist progress across reloads
  ───────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const saved = Number(sessionStorage.getItem('maxWatched') ?? 0);
    if (saved) setMaxWatched(saved);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('maxWatched', String(maxWatched));
  }, [maxWatched]);

  /* ──────────────────────────────────────────────────────────────── */
  return (
    <main className='flex flex-col items-center gap-6 py-10 px-4'>
      <h1 className='text-xl font-semibold'>Tutorial</h1>

      <p>Press the play button below to start the video.</p>

      <div className='w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden'>
        <video
          ref={videoRef}
          src={VIDEO_URL}
          playsInline
          preload='auto'
          className='w-full h-full object-contain object-center bg-white'
          // className="w-full h-full object-contain object-center"
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
          onEnded={handleEnded}
          controls={false}
          disablePictureInPicture
          controlsList='nodownload noplaybackrate nofullscreen noremoteplayback'
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>

      <Button variant='outline' onClick={togglePlay}>
        {playing ? 'Pause' : 'Play'}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Proceed to experiment</Button>
        </AlertDialogTrigger>

        {finished ? (
          <AlertDialogContent>
            <AlertDialogTitle>Ready!</AlertDialogTitle>
            <AlertDialogAction onClick={() => router.push('/realtime')}>
              Start Experiment
            </AlertDialogAction>
          </AlertDialogContent>
        ) : (
          <AlertDialogContent>
            <AlertDialogTitle>Finish the video first</AlertDialogTitle>
            <AlertDialogDescription className='mb-4'>
              Please watch the full tutorial before starting the experiment.
            </AlertDialogDescription>
            <AlertDialogAction autoFocus>Return to video</AlertDialogAction>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </main>
  );
}

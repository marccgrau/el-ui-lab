'use client';

import React, { useCallback, useState } from 'react';
import {
  useRTVIClientEvent,
  usePipecatClientTransportState,
  VoiceVisualizer,
  PipecatClientAudio,
} from '@pipecat-ai/client-react';
import { RTVIEvent } from '@pipecat-ai/client-js';
import { Check, Copy } from 'lucide-react';

import { Providers } from './PipecatProvider';
import { ConnectButton } from './ConnectButton';

/* ───── Message types ───── */
interface ServerMessage {
  data?: {
    type?: string;
    payload?: {
      text?: string;
      code?: string;
    };
  };
  type?: string;
  payload?: {
    text?: string;
    code?: string;
  };
}

/* ───── Advice bubble ───── */
function AdviceBubble() {
  const [advice, setAdvice] = useState<string | null>(null);
  useRTVIClientEvent(
    RTVIEvent.ServerMessage,
    useCallback((msg: ServerMessage) => {
      const data = msg?.data?.type ? msg.data : msg;
      if (data?.type === 'advice' && typeof data.payload?.text === 'string') {
        setAdvice(data.payload.text);
      }
    }, [])
  );
  return advice ? (
    <div className='max-w-m rounded-xl bg-amber-100 text-amber-900 p-4 shadow-lg'>
      <p className='font-semibold mb-2'>AI&nbsp;Advice</p>
      {advice}
    </div>
  ) : null;
}

/* ───── Prolific banner ───── */
function ProlificBanner({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // reset after 2 s
    } catch {
      /* fallback: do nothing – browser blocked */
    }
  };

  return (
    <div className='flex flex-col items-center justify-center gap-6 p-8'>
      <h2 className='text-2xl font-semibold'>Thank you for participating!</h2>

      <p className='text-center max-w-md'>
        You are done with the experiment. You can close this window now.
        <br />
        Make sure to copy your Prolific code below:
      </p>

      <div className='flex items-center gap-4'>
        <span className='rounded bg-black px-4 py-2 font-mono text-xl text-white'>
          {code}
        </span>

        <button
          type='button'
          onClick={handleCopy}
          className='inline-flex items-center gap-1 rounded border px-3 py-2 text-sm hover:bg-gray-100 active:bg-gray-200'
        >
          {copied ? (
            <>
              <Check size={16} /> Copied!
            </>
          ) : (
            <>
              <Copy size={16} /> Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ───── Inner component that consumes Pipecat client context ───── */
function RealtimePipecatInner() {
  const [completed, setCompleted] = useState(false);
  const [experimentCode, setExperimentCode] = useState('517');

  /* must be called *inside* provider */
  const transportState = usePipecatClientTransportState();

  const isActive = transportState === 'connected' || transportState === 'ready';
  const showButton = !isActive;

  /* listen for bot “done” messages */
  useRTVIClientEvent(
    RTVIEvent.ServerMessage,
    useCallback((msg: ServerMessage) => {
      const data = msg?.data?.type ? msg.data : msg;
      if (data?.type === 'session_saved' || data?.type === 'terminate') {
        if (typeof data.payload?.code === 'string') {
          setExperimentCode(data.payload.code);
        }
        setCompleted(true);
      }
    }, [])
  );

  if (completed) {
    return (
      <>
        <ProlificBanner code={experimentCode} />
        <PipecatClientAudio />
      </>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center gap-6'>
      {showButton && <ConnectButton />}

      {isActive && (
        <>
          <VoiceVisualizer
            participantType='local'
            barGap={4}
            barWidth={24}
            barMaxHeight={192}
            backgroundColor='white'
            barColor='darkgrey'
          />
          <AdviceBubble />
        </>
      )}

      <PipecatClientAudio />
    </div>
  );
}

/* ───── Exported top-level that installs the provider ───── */
export default function RealtimePipecat() {
  return (
    <Providers>
      <RealtimePipecatInner />
    </Providers>
  );
}

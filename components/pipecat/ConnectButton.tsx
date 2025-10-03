'use client';

import {
  usePipecatClient,
  usePipecatClientTransportState,
} from '@pipecat-ai/client-react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function ConnectButton() {
  const client = usePipecatClient();
  const transportState = usePipecatClientTransportState();

  const isConnected = ['connected', 'ready'].includes(transportState);
  const isBusy = ['connecting', 'disconnecting'].includes(transportState);

  const handleClick = async () => {
    if (!client) return console.error('Pipecat client not initialised');

    try {
      if (isConnected) {
        await client.disconnect();
      } else {
        await client.connect({
          endpoint: '/api/pipecat/start-session',
          requestData: {
            prolific_pid: sessionStorage.getItem('PROLIFIC_PID'),
            civility_mode: sessionStorage.getItem('CIVILITY_MODE'),
            advice_condition: sessionStorage.getItem('ADVICE_CONDITION'),
            scenario: sessionStorage.getItem('SCENARIO'),
          },
        });
      }
    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  return (
    <div className='flex items-center'>
      <Button
        type='button'
        variant={isConnected ? 'destructive' : 'default'}
        className='w-64 gap-2'
        disabled={!client || isBusy}
        aria-busy={isBusy}
        onClick={handleClick}
      >
        {isBusy && <Loader2 className='h-4 w-4 animate-spin' />}
        {isConnected ? 'Disconnect' : 'Start the conversation'}
      </Button>
    </div>
  );
}

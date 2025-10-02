// components/pipecat/Providers.tsx
'use client';

import { PipecatClientProvider } from '@pipecat-ai/client-react';
import { PropsWithChildren, useEffect, useState } from 'react';

export function Providers({ children }: PropsWithChildren) {
  const [client, setClient] = useState<
    import('@pipecat-ai/client-js').PipecatClient | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // ⏬ these imports are evaluated **after** window exists
      const [{ PipecatClient }, { DailyTransport }] = await Promise.all([
        import('@pipecat-ai/client-js'),
        import('@pipecat-ai/daily-transport'),
      ]);

      if (cancelled) return;

      const pc = new PipecatClient({
        transport: new DailyTransport(),
        enableMic: true,
        enableCam: false,
      });

      setClient(pc);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* Show nothing (or a loader / skeleton) until the client is ready */
  if (!client) return null;

  return (
    <PipecatClientProvider client={client}>{children}</PipecatClientProvider>
  );
}

'use client';
import React from 'react';
import KnowledgeBaseCard from '@/components/cards/KnowledgeBaseCard';
import InteractionCard from '@/components/cards/InteractionCard';
import RealtimePipecat from '@/components/pipecat/RealtimePipecat';

export default function VoicePage() {
  return (
    <div className='flex h-screen gap-4 p-4'>
      <KnowledgeBaseCard className='w-1/2' />
      <InteractionCard className='w-1/2 flex flex-col'>
        <RealtimePipecat />
      </InteractionCard>
    </div>
  );
}

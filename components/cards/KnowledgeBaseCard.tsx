'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';

/* ------------------------------------------------------------ */
/* helpers                                                      */
/* ------------------------------------------------------------ */
const KB_KEY = 'kb-guidelines-v1'; // bump when file changes
const KB_URL = '/kb/guidelines.md';

const highlight = (md: string, q: string) =>
  !q
    ? md
    : md.replace(
        new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
        '<mark>$1</mark>'
      );

/* ------------------------------------------------------------ */
/* component                                                    */
/* ------------------------------------------------------------ */
export default function KnowledgeBaseCard({
  className,
}: {
  className?: string;
}) {
  const [md, setMd] = useState<string>('');
  const [query, setQuery] = useState('');
  const firstHitRef = useRef<HTMLSpanElement>(null);

  /* ---------- load + cache markdown ------------------------- */
  useEffect(() => {
    const cached = localStorage.getItem(KB_KEY);
    if (cached) {
      setMd(cached);
      return;
    }
    fetch(KB_URL)
      .then((r) => r.text())
      .then((txt) => {
        localStorage.setItem(KB_KEY, txt);
        setMd(txt);
      })
      .catch(() => setMd('*Error loading knowledge base.*'));
  }, []);

  /* ---------- jump to first hit on Enter -------------------- */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter')
      firstHitRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /* ---------- highlight search ------------------------------ */
  let firstSeen = false;
  const content = highlight(md, query);

  return (
    <Card className={`p-6 flex flex-col ${className ?? ''}`}>
      <CardHeader className='pb-2'>
        <CardTitle>Knowledge Base</CardTitle>
        <CardDescription>Company guidelines & processes</CardDescription>

        {/* Sticky search bar */}
        <div className='sticky top-2 z-10'>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder='Search…'
            className='w-full mt-3 rounded border px-3 py-2 text-sm'
          />
        </div>
      </CardHeader>

      <CardContent className='overflow-y-auto prose max-w-none px-6 pb-6'>
        <ReactMarkdown
          remarkPlugins={[
            remarkGfm,
            [remarkToc, { heading: '## Table of Contents', maxDepth: 3 }],
          ]}
          rehypePlugins={[rehypeSlug, rehypeRaw]}
          components={{
            /* keep only the <mark> override for highlighting */
            mark({ ...props }) {
              if (!firstSeen) {
                firstSeen = true;
                return <mark ref={firstHitRef} {...props} />;
              }
              return <mark {...props} />;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
}

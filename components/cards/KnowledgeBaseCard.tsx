'use client';
import React, { useEffect, useState } from 'react';
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

/* ------------------------------------------------------------ */
/* component                                                    */
/* ------------------------------------------------------------ */
export default function KnowledgeBaseCard({
  className,
}: {
  className?: string;
}) {
  const [md, setMd] = useState<string>('');

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

  return (
    <Card className={`p-6 flex flex-col ${className ?? ''}`}>
      <CardHeader className='pb-2'>
        <CardTitle>Knowledge Base</CardTitle>
        <CardDescription>Company guidelines & processes</CardDescription>
      </CardHeader>

      <CardContent className='overflow-y-auto prose max-w-none px-6 pb-6'>
        <ReactMarkdown
          remarkPlugins={[
            remarkGfm,
            [remarkToc, { heading: '## Table of Contents', maxDepth: 3 }],
          ]}
          rehypePlugins={[rehypeSlug, rehypeRaw]}
        >
          {md}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
}

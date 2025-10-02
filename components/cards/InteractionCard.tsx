'use client';
import React, {
  ReactNode,
  isValidElement,
  cloneElement,
  Children,
} from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function InteractionCard({ children, className }: Props) {
  /* experiment state ------------------------------------------------ */

  /* recursive prop injection ---------------------------------------- */
  const enrich = (node: ReactNode): ReactNode => {
    if (!isValidElement(node)) return node; // strings, null, etc.
    if (typeof node.type === 'string') return node; // DOM elements

    // Type guard: treat as ReactElement with props that may contain children
    const element = node as React.ReactElement<{ children?: ReactNode }>;

    const { children: nodeChildren, ...rest } = element.props ?? {};

    return cloneElement(element, {
      ...rest,
      children: Children.map(nodeChildren, enrich),
    });
  };

  const injected = Children.map(children, enrich);

  /* UI shell -------------------------------------------------------- */
  return (
    <Card className={`h-full flex flex-col p-6 ${className ?? ''}`}>
      <CardHeader className='flex-none'>
        <CardTitle>Interaction</CardTitle>
        <CardDescription>Help out the customer</CardDescription>
      </CardHeader>

      <CardContent className='flex-1 overflow-y-auto'>{injected}</CardContent>
    </Card>
  );
}

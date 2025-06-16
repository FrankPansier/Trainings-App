'use client'

import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { twMerge } from 'tailwind-merge'


const Accordion = AccordionPrimitive.Root

const AccordionItem = AccordionPrimitive.Item

const AccordionTrigger = ({ children, ...props }: any) => (
  <AccordionPrimitive.Header>
    <AccordionPrimitive.Trigger
      className={twMerge(
        'flex w-full items-center justify-between rounded-md bg-zinc-800 px-4 py-2 text-left text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none'
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
)

const AccordionContent = ({ children, ...props }: any) => (
  <AccordionPrimitive.Content
    className={twMerge('px-4 py-3 text-sm text-white')}
    {...props}
  >
    {children}
  </AccordionPrimitive.Content>
)

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

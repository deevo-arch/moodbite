import { NextRequest } from 'next/server';
import { eventEmitter } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  let responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  
  const encoder = new TextEncoder();
  const listener = (data: any) => {
    writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };
  
  eventEmitter.on('order-update', listener);
  
  req.signal.addEventListener('abort', () => {
    eventEmitter.off('order-update', listener);
    writer.close();
  });

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

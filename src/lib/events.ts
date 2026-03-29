import { EventEmitter } from 'events';

// Prevent Node from complaining about memory leaks during dev reloads
const globalForEvents = global as unknown as { eventEmitter: EventEmitter };

export const eventEmitter =
  globalForEvents.eventEmitter || new EventEmitter();

if (process.env.NODE_ENV !== 'production') globalForEvents.eventEmitter = eventEmitter;

// Increase max listeners since many clients could connect locally
eventEmitter.setMaxListeners(50);

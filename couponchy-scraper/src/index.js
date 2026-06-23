import { startServer } from './http/server.js';
import { initScheduler } from './cron/scheduler.js';

console.log('================================================');
console.log('       COUPONCHY AI AUTOMATION SERVICE         ');
console.log('================================================');

// 1. Initialize cron job scheduler
initScheduler();

// 2. Start the HTTP server
startServer();

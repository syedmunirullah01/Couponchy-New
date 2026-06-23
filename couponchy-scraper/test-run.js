import { runDiscoveryPipeline } from './src/scraper/discover.js';
import { runValidationPipeline } from './src/scraper/validate.js';
import { supabase } from './src/config/supabase.js';

async function main() {
  console.log('--- RUNNING LOCAL SCRAPER TEST ---');
  try {
    console.log('Clearing old scraper targets from database...');
    await supabase.from('scraper_targets').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Starting Discovery pipeline test...');
    const stats = await runDiscoveryPipeline();
    console.log('Discovery stats:', stats);
    
    console.log('\nStarting Validation pipeline test...');
    const valStats = await runValidationPipeline();
    console.log('Validation stats:', valStats);
    
    console.log('\n--- TEST COMPLETE ---');
  } catch (err) {
    console.error('Test run failed:', err);
  }
}

main();

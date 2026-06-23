import * as cheerio from 'cheerio';

/**
 * Cleans the HTML of scripts/styles/nav elements and extracts relevant content
 * to minimize token usage for the Gemini API.
 * 
 * @param {string} html - Raw HTML page content
 * @param {object} target - Target settings (e.g. selectors)
 * @returns {object} Cleaned content details
 */
export function parseHtml(html, target = {}) {
  const $ = cheerio.load(html);

  // 1. Remove non-content elements
  $('script, style, noscript, iframe, svg, header, footer, nav, link, meta, head').remove();
  
  // Remove common generic navigation/social/advertising containers
  $('.header, .footer, .nav, .menu, .sidebar, .comments, .social, .advertisement, #header, #footer, #sidebar, #nav').remove();

  let textContent = '';
  let blocks = [];

  // 2. If a specific coupon selector is provided, extract only matches
  if (target.coupon_selector) {
    $(target.coupon_selector).each((i, el) => {
      const blockText = $(el).text().replace(/\s+/g, ' ').trim();
      if (blockText) {
        blocks.push(`Block ${i + 1}: ${blockText}`);
      }
    });
    if (blocks.length > 0) {
      textContent = blocks.join('\n\n');
    } else {
      console.log(`[Parser] Target coupon_selector "${target.coupon_selector}" matched 0 elements. Falling back to heuristic extraction.`);
    }
  }

  if (blocks.length === 0) {
    // Look for coupon-like elements by common classes/IDs
    const fallbackBlocks = [];
    $('*').each((i, el) => {
      const className = $(el).attr('class') || '';
      const idName = $(el).attr('id') || '';
      
      const isOfferContainer = 
        (typeof className === 'string' && className.match(/(coupon|promo|offer|deal|discount|code|voucher|save)/i)) ||
        (typeof idName === 'string' && idName.match(/(coupon|promo|offer|deal|discount|code|voucher|save)/i));
        
      if (isOfferContainer) {
        // Try to get text from lower level containers to avoid nesting duplicate text
        const childMatches = $(el).find('[class*="coupon"], [class*="offer"], [class*="deal"], [class*="code"]');
        if (childMatches.length === 0) {
          const text = $(el).text().replace(/\s+/g, ' ').trim();
          if (text && text.length > 10 && text.length < 500) {
            fallbackBlocks.push(text);
          }
        }
      }
    });

    if (fallbackBlocks.length > 0) {
      // Deduplicate blocks
      const uniqueBlocks = [...new Set(fallbackBlocks)];
      textContent = uniqueBlocks.join('\n\n');
    } else {
      // Fallback: just get the body's cleaned text
      textContent = $('body').text().replace(/\s+/g, ' ').trim();
    }
  }

  // Cap length to avoid huge token costs (e.g., max 35,000 characters)
  if (textContent.length > 35000) {
    console.log(`[Parser] Truncating text content from ${textContent.length} to 35000 chars.`);
    textContent = textContent.substring(0, 35000);
  }

  return {
    cleanedText: textContent
  };
}

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY environment variable.');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Using gemini-2.5-flash since it is highly performant and supported
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',
  }
});

const extractionSchema = {
  type: "object",
  properties: {
    coupons: {
      type: "array",
      description: "List of coupon codes, promo codes, or deals extracted from the page text.",
      items: {
        type: "object",
        properties: {
          title: { 
            type: "string", 
            description: "Short catchy title of the offer (e.g. '20% Off Storewide', '$10 Off Orders over $50')" 
          },
          code: { 
            type: "string", 
            description: "The coupon or promo code characters (e.g. 'SAVE20', 'WELCOME10'). Leave empty if it is a general deal/sale without a code." 
          },
          description: { 
            type: "string", 
            description: "Additional terms, conditions, or description of the offer." 
          },
          type: { 
            type: "string", 
            enum: ["Coupon", "Deal"],
            description: "Use 'Coupon' if a promo code is present, otherwise use 'Deal'." 
          },
          expiryDate: { 
            type: "string", 
            description: "The expiry date formatted as YYYY-MM-DD. If year is missing, assume current year or next year depending on context. Leave empty if no expiry date is specified." 
          },
          isSitewide: {
            type: "boolean",
            description: "Set to true if this coupon code applies sitewide/storewide/across all items on the store (e.g. '20% off sitewide', 'sitewide saving', 'all items'). Set to false if it only applies to specific items, clearance, or categories."
          }
        },
        required: ["title", "code", "description", "type", "isSitewide"]
      }
    }
  },
  required: ["coupons"]
};

/**
 * Extracts structured coupon offers from raw text content using Gemini API.
 * 
 * @param {string} textContent - Cleaned text from store web page
 * @param {string} storeName - Name of the store being scraped (helps with prompt context)
 * @returns {Promise<Array>} List of extracted offers
 */
export async function aiExtractCoupons(textContent, storeName) {
  if (!textContent || textContent.trim().length < 20) {
    console.log(`[AI Extract] Text content too short for extraction: ${textContent.length} chars`);
    return [];
  }

  const prompt = `
You are an expert shopping assistant and web data extractor.
Your task is to analyze the text scraped from a webpage for the store "${storeName}" and extract all active coupon codes, promo codes, discounts, and sales deals.

Here is the cleaned text content from the webpage:
"""
${textContent}
"""

Extract all offers and structure them exactly into JSON following this schema:
${JSON.stringify(extractionSchema, null, 2)}

Instructions:
1. Extract both promo codes (type="Coupon") and generic site sales/discounts (type="Deal").
2. Only extract actual offers, codes, or deals. Ignore general site text, header/footer links, or generic information.
3. Clean the promo codes (e.g., "SAVE20" instead of "Code: SAVE20").
4. For expiryDate, parse and convert expressions like "Expires 12/31/25" or "Valid until Dec 31" to YYYY-MM-DD.
5. If no coupon codes or deals are found in the text, return an empty coupons array.
`;

  try {
    console.log(`[AI Extract] Calling Gemini to extract coupons for ${storeName}...`);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON output
    const data = JSON.parse(responseText);
    
    if (data && Array.isArray(data.coupons)) {
      console.log(`[AI Extract] Extracted ${data.coupons.length} offers for ${storeName}`);
      return data.coupons;
    }
    
    return [];
  } catch (error) {
    console.error(`[AI Extract] Error calling Gemini API for ${storeName}:`, error.message);
    // Return empty list on failure rather than crashing the whole scrape job
    return [];
  }
}

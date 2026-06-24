/**
 * Seed script for blogs table.
 * Run once with: node scripts/seedBlogs.js
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MOCK_BLOGS = [
  {
    slug: "coupon-stacking-secrets",
    title: "The Art of Stacked Savings: Double Your Checkout Discounts",
    excerpt: "A masterclass in smart checkout optimization. Discover how to legally layer store coupons, seasonal deals, payment-method cashbacks, and free shipping codes to drop prices to near-zero.",
    read_time: "5 min read",
    category: "Savings Hacks",
    is_featured: true,
    image: "/images/blog/featured.png",
    author_name: "Couponchy Team",
    author_role: "Savings Experts",
    author_avatar: "C",
    author_bio: "The Couponchy Team is dedicated to automated coupon verification, checkout optimizations, and sharing the best savings strategies to help you get the lowest price.",
    content: `
      <p class="lead">
        We have all been there. You reach the final stage of checkout, find a generic promo code online, paste it, and receive a dreaded error: <em>"This code cannot be combined with other offers."</em> But what if you could bypass these restrictions legally?
      </p>
      
      <p>
        In modern ecommerce, retailers build complex discount hierarchies. When you understand how these rules are evaluated behind the scenes, you can coordinate your actions to "stack" discounts, layering savings until a $150 cart drops below $50. Here is the developer's guide to ecommerce discount stacking.
      </p>

      <h2>1. The Four-Layer Discount Hierarchy</h2>
      <p>
        Most checkout engines evaluate cart logic in a specific sequence. Stacking succeeds when you target different layers of this execution flow.
      </p>
      
      <div class="my-8 rounded-2xl border border-white/8 bg-white/[0.02] p-6">
        <h4 class="text-white font-extrabold mb-3">The Standard Evaluation Chain:</h4>
        <ol class="space-y-2 text-white/70 pl-5 list-decimal">
          <li><strong>Layer 1 (Item-Level Reductions):</strong> Automated clearance prices, markdowns, or dynamic sale tags on specific products.</li>
          <li><strong>Layer 2 (Cart-Level Promo Codes):</strong> Manual discount codes entered in the input field (e.g., 20% off total order).</li>
          <li><strong>Layer 3 (Shipping Exceptions):</strong> Free shipping vouchers or automatic order threshold overrides (e.g., Free shipping over $75).</li>
          <li><strong>Layer 4 (Payment Rails & Cashback):</strong> Credit card discount programs, store credit rewards, or third-party affiliate cashbacks.</li>
        </ol>
      </div>

      <h2>2. Layering Store Sale + Cart Codes</h2>
      <p>
        The first rule of stacking is simple: <strong>Never use a coupon code on a full-price item if you can avoid it.</strong> Look for items already marked down (Layer 1). Most platforms (such as Shopify or Salesforce Commerce Cloud) apply manual promo codes (Layer 2) to the *current cart total*, including already discounted clearance prices.
      </p>
      <blockquote>
        "If an item is marked down by 30%, and you enter a 20% off code, the net reduction is 44% off the original price, not 50%. However, this represents the easiest stack available."
      </blockquote>

      <h2>3. The Payment-Method Arbitrage</h2>
      <p>
        Once you have combined Layer 1 and Layer 2, you move to Layer 4 (the payment layer). This is where massive savings are unlocked. Many payment providers (like PayPal, Apple Pay, or credit card networks) offer rewards. By paying with a credit card that has a 5% cashback category for that merchant, or utilizing store credit bought at a discount (e.g., a $100 gift card bought for $85), you secure an immediate, un-cancellable extra reduction.
      </p>

      <h2>4. Step-by-Step Stacking Strategy</h2>
      <ul>
        <li><strong>Step 1:</strong> Pre-select items in the clearance or markdown categories.</li>
        <li><strong>Step 2:</strong> Hunt for a code that is site-wide. Site-wide codes apply to clearance items more often than item-specific codes.</li>
        <li><strong>Step 3:</strong> Ensure your cart total meets the minimum threshold for free shipping *after* all discounts are applied.</li>
        <li><strong>Step 4:</strong> Check out using a cash-back portal or discounted gift card payment rail.</li>
      </ul>

      <hr />
      
      <p class="text-sm text-white/50">
        <em>Disclaimer: Terms of service vary between merchants. Some platforms actively monitor checkout anomalies, but following standard stacking sequences complies fully with standard ecommerce rules.</em>
      </p>
    `
  },
  {
    slug: "how-simulated-checkout-works",
    title: "Automated Verifications: Why Fake Coupons are History",
    excerpt: "Behind Couponchy's automated checkout simulator. We examine how headless browser scripts test every deal, so you don't get the 'invalid code' alert ever again.",
    read_time: "4 min read",
    category: "Tech & Safety",
    is_featured: false,
    image: "/images/blog/tech.png",
    author_name: "Couponchy Team",
    author_role: "Savings Experts",
    author_avatar: "C",
    author_bio: "The Couponchy Team is dedicated to automated coupon verification, checkout optimizations, and sharing the best savings strategies to help you get the lowest price.",
    content: `
      <p class="lead">
        The web is filled with broken coupon directories. Millions of users waste time copying and pasting dead codes, leading to cart abandonment and checkout frustration. Here is how we solved it with automated browser simulation.
      </p>

      <p>
        At Couponchy, we believe manual code validation is obsolete. Our engineering team designed an automated verification pipeline that simulates real checkouts across thousands of ecommerce sites daily, guaranteeing that every discount tag you see is active.
      </p>

      <h2>1. The Headless Simulation Pipeline</h2>
      <p>
        Instead of relying on user feedback, we deploy headless browser instances powered by Playwright and Chromium. These agents perform full simulated checkouts programmatically.
      </p>

      <div class="my-8 rounded-2xl border border-white/8 bg-[#070707] p-6 font-mono text-[13px] leading-relaxed text-white/80 overflow-x-auto">
        <span class="text-white/40">// Conceptual script for cart code validation</span><br />
        const browser = await chromium.launch({ headless: true });<br />
        const context = await browser.newContext();<br />
        const page = await context.newPage();<br />
        await page.goto(merchantCheckoutUrl);<br />
        await page.fill('#promo-input', couponCode);<br />
        await page.click('#apply-btn');<br />
        const discountText = await page.textContent('.discount-summary');<br />
        console.log("Verified discount: " + discountText);
      </div>

      <h2>2. Handling Captchas and Dynamic Selectors</h2>
      <p>
        Ecommerce checkouts are not uniform. Dynamic selectors, randomized IDs, and anti-scraping systems pose a unique challenge. Our validation pipeline uses a lightweight semantic engine that scans the DOM using machine-learning heuristics to locate input fields, submit buttons, and coupon success indicators regardless of underlying framework changes (e.g. React, Angular, Webflow).
      </p>

      <h2>3. Scaling Checkouts Responsibly</h2>
      <p>
        Testing coupons generates server requests. We work to act as responsible web citizens.
      </p>
      <ul>
        <li><strong>Rate Limiting:</strong> Verification agents schedule runs during low-traffic periods to prevent server load issues for merchants.</li>
        <li><strong>Caching:</strong> Verified results are cached with a dynamic Time-To-Live (TTL) model based on historical coupon expiration patterns.</li>
        <li><strong>Anonymous Sessions:</strong> No personal or session data is used; carts are initialized with dummy items and discarded immediately.</li>
      </ul>

      <h2>4. The Impact of Verified Deals</h2>
      <p>
        By eliminating fake codes, Couponchy increases checkout efficiency and builds trust. When you see a green badge on our platform, it means a simulated browser validated that coupon code within the last few hours.
      </p>
    `
  },
  {
    slug: "smart-shopping-trends-2026",
    title: "Stacked Savings: 7 Hacks for 2026 Black Friday",
    excerpt: "Pre-load your cart, stack rewards, and utilize real-time price tracker extensions. Here is your digital survival checklist for the shopping events of the year.",
    read_time: "6 min read",
    category: "Guides",
    is_featured: false,
    image: "/images/blog/hacks.png",
    author_name: "Couponchy Team",
    author_role: "Savings Experts",
    author_avatar: "C",
    author_bio: "The Couponchy Team is dedicated to automated coupon verification, checkout optimizations, and sharing the best savings strategies to help you get the lowest price.",
    content: `
      <p class="lead">
        Black Friday and Cyber Monday are no longer just shopping days; they are automated battlegrounds where digital retail algorithms dynamically adjust prices based on supply and demand.
      </p>

      <p>
        To win this year, consumers need to transition from passive browsing to programmatic deal hunting. Here is our 7-step digital survival checklist to secure the lowest prices of the year.
      </p>

      <h2>1. Pre-Load Your Cart and Monitor Thresholds</h2>
      <p>
        Many flash discounts require your cart to exceed specific price points (e.g. $100) to trigger high-tier discounts. Pre-load your cart with items you want before sales go live. This lets you apply codes instantly instead of browsing when inventory drops.
      </p>

      <h2>2. Use Price Tracking Extensions</h2>
      <p>
        Retailers sometimes artificially inflate original prices right before a sale to make discounts look larger. Use independent price tracking extensions to view historical price charts and ensure a deal is actually at its all-time low.
      </p>

      <h2>3. Prepare Alternative Payment Rails</h2>
      <p>
        Checkout bottlenecks can result in losing cart inventory. Save multiple payment configurations (e.g. Apple Pay, PayPal, credit cards) to ensure fast transactions during high-demand windows.
      </p>

      <blockquote>
        "Having an alternative payment rail saved me on three major GPU drops last winter. A single system timeout shouldn't ruin your checkout."
      </blockquote>
    `
  },
  {
    slug: "understanding-next-gen-rewards",
    title: "Understanding Next-Gen Retail Rewards & Store Credits",
    excerpt: "From digital cashbacks to store credits, learn what types of discount options actually offer real savings and which ones are just data traps.",
    read_time: "5 min read",
    category: "Guides",
    is_featured: false,
    image: "/images/blog/featured.png",
    author_name: "Couponchy Team",
    author_role: "Savings Experts",
    author_avatar: "C",
    author_bio: "The Couponchy Team is dedicated to automated coupon verification, checkout optimizations, and sharing the best savings strategies to help you get the lowest price.",
    content: `
      <p class="lead">
        Modern loyalty programs are highly optimized customer acquisition models. While some programs offer true financial benefits, others are designed to build locked ecosystems.
      </p>

      <p>
        As consumers, we need to treat loyalty programs as financial transactions. Here is how to evaluate store rewards and separate real savings from locked-in traps.
      </p>

      <h2>1. The Math of Store Credit vs Cashback</h2>
      <p>
        Store credits lock you into a single retailer, encouraging you to buy items you might not need to spend your balance. Direct cashbacks, although sometimes offering lower percentages, give you immediate liquidity.
      </p>

      <h2>2. Identifying Data Mining Schemes</h2>
      <p>
        If a loyalty program requires you to link bank accounts or grant tracking permissions across your device, the real product is your shopping history. Always review what data is shared and opt out of third-party marketing brokers.
      </p>
    `
  }
];

async function run() {
  console.log("=== Seeding Blogs Table in Supabase ===");
  const { data, error } = await supabase
    .from("blogs")
    .upsert(MOCK_BLOGS, { onConflict: "slug" })
    .select();

  if (error) {
    console.error("Error seeding blogs:", error.message);
  } else {
    console.log(`✓ Seeded ${data.length} blogs successfully!`);
  }
}

run();

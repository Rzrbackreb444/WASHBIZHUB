/**
 * IndexNow Submission Script
 * Submit ALL URLs from sitemap to Bing, Yahoo, Yandex, DuckDuckGo
 * Run with: npx tsx scripts/indexnow-submit.ts
 */

import { readFileSync } from "fs";
import { join } from "path";
import { submitAllViaIndexNow } from "../server/auto-indexing";

async function main() {
  console.log("\n🚀 INDEXNOW SUBMISSION SCRIPT\n");
  console.log("Submitting to: Bing, Yahoo, Yandex, DuckDuckGo\n");
  
  // Read sitemap.xml
  const sitemapPath = join(process.cwd(), "public", "sitemap.xml");
  const sitemapXml = readFileSync(sitemapPath, "utf-8");
  
  console.log("✅ Sitemap loaded successfully\n");
  console.log("🔑 Using INDEXNOW_API_KEY\n");
  
  // Submit all URLs via IndexNow
  const result = await submitAllViaIndexNow(sitemapXml);
  
  // Display results
  console.log("\n" + "=".repeat(60));
  console.log("FINAL RESULTS");
  console.log("=".repeat(60));
  console.log(`📊 Total URLs: ${result.total}`);
  console.log(`✅ Succeeded: ${result.succeeded}`);
  console.log(`❌ Failed: ${result.failed}`);
  console.log(`📈 Success Rate: ${((result.succeeded / result.total) * 100).toFixed(1)}%`);
  console.log("=".repeat(60) + "\n");
  
  // Show failed URLs if any
  if (result.failed > 0) {
    console.log("\n❌ FAILED URLS:\n");
    result.results
      .filter(r => !r.success)
      .forEach((r, index) => {
        console.log(`${index + 1}. ${r.url}`);
        console.log(`   Error: ${r.message}\n`);
      });
  } else {
    console.log("✨ All URLs submitted successfully!\n");
    console.log("Your pages are now being crawled by:");
    console.log("  🔵 Bing");
    console.log("  🟣 Yahoo");
    console.log("  🔴 Yandex");
    console.log("  🦆 DuckDuckGo\n");
  }
}

main().catch(console.error);

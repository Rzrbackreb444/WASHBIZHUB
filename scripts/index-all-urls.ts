/**
 * Google Indexing Script - Submit ALL URLs from sitemap to Google
 * Run with: npx tsx scripts/index-all-urls.ts
 */

import { readFileSync } from "fs";
import { join } from "path";
import { submitAllToGoogle } from "../server/auto-indexing";

async function main() {
  console.log("\n🚀 GOOGLE INDEXING SCRIPT\n");
  console.log("Reading sitemap.xml...\n");
  
  // Read sitemap.xml
  const sitemapPath = join(process.cwd(), "public", "sitemap.xml");
  const sitemapXml = readFileSync(sitemapPath, "utf-8");
  
  console.log("✅ Sitemap loaded successfully\n");
  console.log("🔑 Using GOOGLE_SEARCH_CONSOLE_API_KEY\n");
  
  // Submit all URLs to Google
  const result = await submitAllToGoogle(sitemapXml);
  
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
  }
  
  console.log("\n✨ Indexing complete!\n");
}

main().catch(console.error);

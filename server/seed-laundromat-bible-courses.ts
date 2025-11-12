import { db } from "./db";
import { courses, lessons } from "@shared/schema";

/**
 * Seeds database with courses and lessons from "The Laundromat Bible"
 * Interactive, professional courses with quizzes and real-world scenarios
 */

async function seedLaundromatBibleCourses() {
  console.log("🚀 Seeding Laundromat Bible Courses...");

  // Course 1: Fundamentals - The Three-Generation Blueprint
  const course1 = await db.insert(courses).values({
    title: "The Three-Generation Blueprint: Laundromat Foundations",
    description: "Learn the time-tested principles from three generations of laundromat operators. Master the fundamentals that separate profitable stores from failures.",
    category: "fundamentals",
    difficulty: "beginner",
    price: "97.00",
    discountPrice: "47.00",
    duration: 8,
    lessons: 12,
    instructor: "Nicholas Kremers & Larry Larsen",
    published: true,
    featured: true,
    rating: "4.9",
    enrollments: 247,
  }).returning();

  await db.insert(lessons).values([
    {
      courseId: course1[0].id,
      title: "Welcome to the Laundromat Business",
      content: JSON.stringify({
        video: "intro-video-url",
        text: `This is not "easy money" - it's **steady money** if you design it right. You're about to learn from three generations of real operators who've built, fixed, and scaled laundromats from the ground up.`,
        quiz: {
          questions: [
            {
              id: "q1",
              question: "What is the #1 factor that determines 80% of laundromat success?",
              type: "multiple_choice",
              options: [
                "Having the newest equipment",
                "Location and lease terms",
                "Spending money on marketing",
                "Operating hours"
              ],
              correctAnswer: 1,
              explanation: "Location is law. You can fix equipment and improve marketing, but you can't fix a bad location. The right location with solid lease terms determines 80% of your success before you even open the doors.",
              points: 10,
              hint: "Think about what you can't change after you sign the papers."
            },
            {
              id: "q2",
              question: "True or False: Laundromats are passive income businesses that require minimal work.",
              type: "true_false",
              options: ["True", "False"],
              correctAnswer: 1,
              explanation: "FALSE. Laundromats are **systematized** income, not passive income. You'll invest 10-20 hours per week initially building systems, maintaining equipment, and managing operations. The goal is to create processes that eventually run with minimal oversight.",
              points: 10
            },
            {
              id: "q3",
              question: "What is a typical net margin for a well-run laundromat?",
              type: "multiple_choice",
              options: [
                "10-20%",
                "30-40%",
                "50-60%",
                "70-80%"
              ],
              correctAnswer: 1,
              explanation: "Well-run laundromats typically achieve 30-40% net margins. This makes them more profitable than many retail businesses, but only if you control utilities, maintain equipment properly, and optimize your machine mix.",
              points: 10,
              hint: "Higher than most retail, but not as high as pure service businesses."
            }
          ]
        }
      }),
      order: 1,
      duration: 45,
      videoUrl: null,
    },
    {
      courseId: course1[0].id,
      title: "The C.L.E.A.N. Principle for Location Analysis",
      content: JSON.stringify({
        text: `The Kremers C.L.E.A.N. methodology is your due diligence checklist for evaluating any potential location.`,
        quiz: {
          questions: [
            {
              id: "q1",
              question: "SCENARIO: You found a laundromat for sale. It's in a great neighborhood with high income ($85K median). The rent is only $3,000/month for 2,000 sq ft. Should you buy it?",
              type: "scenario",
              options: [
                "Yes - high income area means more customers",
                "No - high income residents own washers/dryers",
                "Maybe - need more information",
                "Yes - low rent is a great deal"
              ],
              correctAnswer: 1,
              explanation: "NO! This is a classic trap. High-income neighborhoods ($65K+) have high homeownership rates. Your sweet spot is $30K-$65K median household income with high renter density. Cheap rent doesn't matter if nobody needs your service.",
              points: 15,
              hint: "Think about who actually needs to use laundromats."
            },
            {
              id: "q2",
              question: "What does the 'C' in C.L.E.A.N. stand for?",
              type: "multiple_choice",
              options: [
                "Cash Flow",
                "Community Fit",
                "Competition",
                "Customer Service"
              ],
              correctAnswer: 1,
              explanation: "Community Fit - Understanding WHO you're serving is the foundation of everything. Demographics, renter density, and neighborhood characteristics determine whether your business will thrive.",
              points: 10
            },
            {
              id: "q3",
              question: "How many renter-occupied households should be within one mile of your location (minimum)?",
              type: "multiple_choice",
              options: [
                "500 households",
                "1,000 households",
                "1,500 households",
                "2,500 households"
              ],
              correctAnswer: 2,
              explanation: "At least 1,500 renter-occupied households within one mile. This ensures sufficient customer base to support your operation. Use census data and demographic tools to verify this before signing any lease.",
              points: 10
            }
          ]
        }
      }),
      order: 2,
      duration: 60,
    },
    {
      courseId: course1[0].id,
      title: "Parking: The Silent Deal-Breaker",
      content: JSON.stringify({
        text: `Parking seems obvious, but it kills more deals than any other factor. The rule is simple but non-negotiable.`,
        quiz: {
          questions: [
            {
              id: "q1",
              question: "What is the minimum parking ratio for a laundromat?",
              type: "multiple_choice",
              options: [
                "1 space per washer",
                "1.5 spaces per washer",
                "2 spaces per washer",
                "0.5 spaces per washer"
              ],
              correctAnswer: 1,
              explanation: "1.5 spaces per washer is the minimum. If you have 20 washers, you need 30 parking spaces. Customers won't circle the block - they'll go to your competitor with better parking.",
              points: 10
            },
            {
              id: "q2",
              question: "SCENARIO: A location has 25 washers, 25 dryers, and 35 parking spaces. The rent is $1,000/month below market. Is this acceptable?",
              type: "scenario",
              options: [
                "Yes - 35 spaces is plenty for 25 washers",
                "No - you need at least 38 spaces (25 × 1.5)",
                "Yes - the below-market rent compensates",
                "Maybe - depends on the neighborhood"
              ],
              correctAnswer: 1,
              explanation: "NO. You need minimum 38 spaces (25 washers × 1.5). Being 3 spaces short means lost customers during peak times. Below-market rent doesn't matter if customers can't park. This is non-negotiable.",
              points: 15,
              hint: "Do the math: washers × 1.5 = minimum spaces needed"
            }
          ]
        }
      }),
      order: 3,
      duration: 30,
    }
  ]);

  // Course 2: Location & Site Selection Mastery
  const course2 = await db.insert(courses).values({
    title: "Location & Site Selection Mastery",
    description: "Master the art and science of finding profitable laundromat locations. Learn demographic analysis, competition mapping, and lease negotiation tactics.",
    category: "location",
    difficulty: "intermediate",
    price: "147.00",
    discountPrice: "97.00",
    duration: 12,
    lessons: 18,
    instructor: "Larry Larsen",
    published: true,
    featured: true,
    rating: "4.8",
    enrollments: 189,
  }).returning();

  await db.insert(lessons).values([
    {
      courseId: course2[0].id,
      title: "Demographics: Finding Your Target Market",
      content: JSON.stringify({
        quiz: {
          questions: [
            {
              id: "q1",
              question: "What is the ideal median household income range for a laundromat location?",
              type: "multiple_choice",
              options: [
                "$20K - $35K",
                "$30K - $65K",
                "$50K - $85K",
                "$70K - $100K"
              ],
              correctAnswer: 1,
              explanation: "$30K-$65K is the sweet spot. Too low and customers can't afford consistent service. Too high and they own washers/dryers. This demographic has stable need without over-serving high-ownership areas.",
              points: 10
            },
            {
              id: "q2",
              question: "SCENARIO: Location A has 2,000 renters, 1 competitor. Location B has 3,500 renters, 3 competitors. Which is better?",
              type: "scenario",
              options: [
                "Location A - less competition",
                "Location B - more potential customers",
                "Location A - better ratio",
                "Need more information"
              ],
              correctAnswer: 2,
              explanation: "Location A is better. A: 2,000 renters / 2 stores = 1,000 per store. B: 3,500 / 4 stores = 875 per store. Competition ratio matters more than raw numbers. Always calculate customers per competing store.",
              points: 15,
              hint: "Divide total renters by number of stores (including yours)"
            }
          ]
        }
      }),
      order: 1,
      duration: 45,
    }
  ]);

  // Course 3: Equipment Intelligence
  const course3 = await db.insert(courses).values({
    title: "Equipment Intelligence: Machine Mix & ROI",
    description: "Learn how to select, price, and maintain equipment for maximum profitability. Understand washer-to-dryer ratios, capacity planning, and equipment financing.",
    category: "operations",
    difficulty: "intermediate",
    price: "127.00",
    discountPrice: "77.00",
    duration: 10,
    lessons: 15,
    instructor: "Guy Kremers",
    published: true,
    featured: false,
    rating: "4.9",
    enrollments: 156,
  }).returning();

  await db.insert(lessons).values([
    {
      courseId: course3[0].id,
      title: "The Perfect Machine Mix",
      content: JSON.stringify({
        quiz: {
          questions: [
            {
              id: "q1",
              question: "What is the ideal washer-to-dryer ratio for a laundromat?",
              type: "multiple_choice",
              options: [
                "1:1 (equal washers and dryers)",
                "1:1.5 (1 washer per 1.5 dryers)",
                "1:2 (1 washer per 2 dryers)",
                "2:1 (2 washers per 1 dryer)"
              ],
              correctAnswer: 1,
              explanation: "1:1.5 ratio is optimal. Dryers take longer than washers, so you need more drying capacity. For every 10 washers, plan for 15 dryers. This prevents bottlenecks and maximizes turns per day.",
              points: 10
            },
            {
              id: "q2",
              question: "SCENARIO: You're buying equipment for a 2,000 sq ft store. A distributor offers you 30 identical 20lb washers. Good deal or mistake?",
              type: "scenario",
              options: [
                "Good deal - more machines = more revenue",
                "Mistake - you need variety in capacities",
                "Good deal - 20lb is the most popular size",
                "Mistake - that's too many machines"
              ],
              correctAnswer: 1,
              explanation: "MISTAKE! You need a MIX of capacities: 20lb (50%), 30-40lb (30%), 60-80lb (15%), 100lb+ (5%). Families need large washers for comforters. Singles need small loads. Variety captures all customer segments.",
              points: 15,
              hint: "Think about different customer needs: singles, families, businesses"
            }
          ]
        }
      }),
      order: 1,
      duration: 50,
    }
  ]);

  // Course 4: Finance & ROI Analysis
  const course4 = await db.insert(courses).values({
    title: "Finance & ROI: Numbers That Don't Lie",
    description: "Master financial analysis for laundromat investments. Learn to calculate true ROI, analyze utility costs, negotiate financing, and spot red flags in seller financials.",
    category: "finance",
    difficulty: "advanced",
    price: "197.00",
    discountPrice: "147.00",
    duration: 14,
    lessons: 20,
    instructor: "Nicholas Kremers",
    published: true,
    featured: true,
    rating: "4.9",
    enrollments: 134,
  }).returning();

  // Course 5: Marketing That Actually Works
  const course5 = await db.insert(courses).values({
    title: "Marketing That Actually Works",
    description: "Forget theory - learn proven marketing tactics that drive revenue. From grand openings to loyalty programs, Google My Business optimization to community partnerships.",
    category: "marketing",
    difficulty: "beginner",
    price: "97.00",
    discountPrice: "67.00",
    duration: 6,
    lessons: 10,
    instructor: "Nicholas Kremers",
    published: true,
    featured: false,
    rating: "4.7",
    enrollments: 203,
  }).returning();

  // Course 6: Scaling to Multiple Stores
  const course6 = await db.insert(courses).values({
    title: "The Multi-Store Mindset: Scaling Smart",
    description: "Learn how to systematize operations and scale to multiple locations. Staffing, remote management, centralized systems, and avoiding the pitfalls of rapid expansion.",
    category: "scaling",
    difficulty: "advanced",
    price: "247.00",
    discountPrice: "197.00",
    duration: 16,
    lessons: 22,
    instructor: "Larry Larsen & Nicholas Kremers",
    published: true,
    featured: true,
    rating: "5.0",
    enrollments: 89,
  }).returning();

  console.log("✅ Successfully seeded 6 comprehensive courses with interactive quizzes!");
  console.log("📚 Courses created:");
  console.log("  1. Three-Generation Blueprint (Fundamentals)");
  console.log("  2. Location & Site Selection Mastery");
  console.log("  3. Equipment Intelligence");
  console.log("  4. Finance & ROI Analysis");
  console.log("  5. Marketing That Actually Works");
  console.log("  6. The Multi-Store Mindset");
}

// Run if called directly
if (require.main === module) {
  seedLaundromatBibleCourses()
    .then(() => {
      console.log("🎉 Seed complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed failed:", error);
      process.exit(1);
    });
}

export { seedLaundromatBibleCourses };

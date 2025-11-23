/**
 * The Laundromat Bible - Premium Course Content
 * 
 * Transforms Nicholas Kremers' 3-generation expertise into
 * world-class, interactive courses with quizzes and calculator integrations
 */

import { KREMERS_DOCTRINE, CLEAN_METHODOLOGY, EQUIPMENT_INSIGHTS, FINANCIAL_FRAMEWORKS, MARKETING_STRATEGIES } from './laundromat-bible-knowledge';

export const LAUNDROMAT_BIBLE_COURSES = [
  {
    id: 'foundation-blueprint',
    title: 'The Three-Generation Blueprint: Foundation First',
    description: 'Master the fundamentals that separate $500K/year operators from failures. Learn the Kremers Doctrine: Location is law, systems beat hustle, and numbers don't lie.',
    category: 'fundamentals',
    difficulty: 'beginner',
    price: '97.00',
    discountPrice: '47.00',
    duration: 480, // 8 hours
    instructor: 'Nicholas Kremers & Larry Larsen',
    published: true,
    featured: true,
    lessons: [
      {
        title: 'Welcome to the Real Business',
        order: 1,
        duration: 30,
        content: {
          text: `
# This Is Not "Easy Money" - It's Steady Money If You Design It Right

You're about to learn from **three generations** of real operators who've built, fixed, and scaled laundromats from the ground up. Not consultants. Not theorists. **Operators**.

## The Kremers Doctrine

${KREMERS_DOCTRINE.pillars.map((p, i) => `${i + 1}. **${p}**`).join('\n')}

> "${KREMERS_DOCTRINE.corePhilosophy}"

## What This Course Delivers

✅ **C.L.E.A.N. Methodology** - The exact framework for evaluating any location  
✅ **Real Numbers** - Actual P&Ls from $30K/month and $90K/month stores  
✅ **Equipment Intelligence** - Washer/dryer ratios that actually work  
✅ **Lease Negotiation** - How to avoid the #1 killer of laundromats  
✅ **Calculator Integration** - Use WashBizHub tools to model YOUR deal  

## Why Most Fail (And You Won't)

- ❌ They chase "passive income" myths  
- ❌ They sign bad leases (game over)  
- ❌ They guess at equipment mix  
- ❌ They ignore the numbers  

**You'll do the opposite.** Let's begin.
          `,
          quiz: {
            questions: [
              {
                id: 'q1',
                question: 'What is the #1 factor that determines 80% of laundromat success?',
                type: 'multiple_choice',
                options: [
                  'Having the newest equipment',
                  'Location and lease terms',
                  'Spending money on marketing',
                  'Operating hours'
                ],
                correctAnswer: 1,
                explanation: 'Location is law. You can fix equipment and improve marketing, but you can't fix a bad location. The right location with solid lease terms determines 80% of your success before you even open the doors.',
                points: 10
              },
              {
                id: 'q2',
                question: 'True or False: Laundromats are passive income businesses.',
                type: 'true_false',
                options: ['True', 'False'],
                correctAnswer: 1,
                explanation: 'FALSE. Laundromats are **systematized** income, not passive. You'll invest 10-20 hours/week initially building systems. The goal is processes that eventually run with minimal oversight.',
                points: 10
              }
            ]
          },
          calculatorEmbed: {
            type: 'revenue-calculator',
            config: { presetScenario: 'beginner-30k' }
          }
        },
        isFree: true
      },
      {
        title: 'The C.L.E.A.N. Methodology - Community Fit',
        order: 2,
        duration: 45,
        content: {
          text: `
# C is for Community Fit: Who Are You Serving?

${CLEAN_METHODOLOGY.framework.C.question}

## The Sweet Spot Demographics

${CLEAN_METHODOLOGY.framework.C.criteria.map(c => `- ${c}`).join('\n')}

## Real-World Example: Philadelphia vs. Suburbs

**Philadelphia Success Story (Our Store):**
- Median income: $42,000
- 78% renters
- 3,200 renter households within 1 mile
- Result: $87K/month gross revenue

**Suburban Failure (Don't Be This Guy):**
- Median income: $110,000
- 15% renters
- Everyone has in-unit washers
- Result: Closed in 18 months

## Action Item: Research Your Market

Use these FREE tools:
1. **Census.gov** - Get renter % and household income
2. **WashBizHub CLEANBI™** - Automated market analysis
3. **Google Maps** - Count apartment complexes within 1 mile

[Embed CLEANBI Calculator Here]

## The Non-Negotiables

✅ Minimum 1,500 renter households  
✅ Income range $30K-$65K (sweet spot)  
✅ 60%+ renters in service area  
❌ Avoid wealthy suburbs (they have their own washers)  
❌ Avoid ultra-low income (collection/safety issues)
          `,
          quiz: {
            questions: [
              {
                id: 'q1',
                question: 'What is the ideal median household income range for a laundromat service area?',
                type: 'multiple_choice',
                options: [
                  '$15K-$25K',
                  '$30K-$65K',
                  '$80K-$120K',
                  'Income doesn't matter'
                ],
                correctAnswer: 1,
                explanation: '$30K-$65K is the sweet spot. Too low creates collection issues. Too high means everyone has in-unit washers. This range has strong demand and reliable payment.',
                points: 10
              },
              {
                id: 'q2',
                question: 'What minimum number of renter-occupied households should be within one mile?',
                type: 'multiple_choice',
                options: ['500', '1,000', '1,500', '3,000'],
                correctAnswer: 2,
                explanation: 'Minimum 1,500 renter households within one mile. This ensures sufficient customer base to support a profitable operation. More is better.',
                points: 10
              }
            ]
          },
          calculatorEmbed: {
            type: 'cleanbi',
            config: { focusArea: 'demographics' }
          }
        }
      },
      {
        title: 'The C.L.E.A.N. Methodology - Lease Logic',
        order: 3,
        duration: 60,
        content: {
          text: `
# L is for Lease Logic: The #1 Killer of Laundromats

${CLEAN_METHODOLOGY.framework.L.question}

## The Iron Rules of Leases

${CLEAN_METHODOLOGY.framework.L.criteria.map(c => `- ${c}`).join('\n')}

## Real Numbers from Our Stores

**Good Lease Example (Our Store):**
- Gross revenue: $87,000/month
- Rent: $8,500/month
- Rent ratio: **9.8%** ✅
- Lease term: 15 years with 2x 5-year options
- Escalation: 2.5% annually (capped)

**Bad Lease Example (Owner Went Broke):**
- Gross revenue: $45,000/month
- Rent: $9,500/month
- Rent ratio: **21%** ❌ (DEATH SENTENCE)
- Lease term: 5 years, no options
- Escalation: 5% annually (unsustainable)

## The Rent Ratio Calculator

Use this formula:
\`\`\`
Rent Ratio = (Monthly Rent / Monthly Gross Revenue) × 100
\`\`\`

**Target: 8-15%** (ideal: 10-12%)

[Embed Rent Ratio Calculator]

## Negotiation Leverage Points

1. **Long-term commitment** = Lower rent
2. **Right of first refusal** if building sells
3. **Cap escalations** at 3% max annually
4. **Tenant improvement allowance** for buildout
5. **Renewal options** at pre-agreed terms

## Red Flags to Walk Away From

🚩 Rent ratio above 18%  
🚩 Lease shorter than 10 years  
🚩 No renewal options  
🚩 Escalation above 4% annually  
🚩 Landlord won't negotiate  

**If you see these: RUN.** No amount of hustle fixes a bad lease.
          `,
          quiz: {
            questions: [
              {
                id: 'q1',
                question: 'What is the ideal rent-to-revenue ratio for a laundromat?',
                type: 'multiple_choice',
                options: ['5-8%', '8-15%', '18-25%', '30%+'],
                correctAnswer: 1,
                explanation: '8-15% is ideal, with the sweet spot at 10-12%. Below 8% is excellent. Above 18% makes profitability nearly impossible.',
                points: 10
              },
              {
                id: 'q2',
                question: 'What is the minimum acceptable lease term for a laundromat?',
                type: 'multiple_choice',
                options: ['3 years', '5 years', '10 years', '20 years'],
                correctAnswer: 2,
                explanation: 'Minimum 10 years with renewal options. Laundromats require significant upfront investment. Short leases create huge risk if you can't renew.',
                points: 10
              }
            ]
          },
          calculatorEmbed: {
            type: 'rent-ratio-calculator',
            config: {}
          }
        }
      },
      {
        title: 'The C.L.E.A.N. Methodology - Equipment Mix',
        order: 4,
        duration: 75,
        content: {
          text: `
# E is for Equipment Mix: The Science of Capacity

${CLEAN_METHODOLOGY.framework.E.question}

## The Golden Ratios

${CLEAN_METHODOLOGY.framework.E.criteria.map(c => `- ${c}`).join('\n')}

## Real Store Equipment Mix (87K/month Revenue)

**Our Philadelphia Store (32 washers, 64 dryers):**

**Washers:**
- 8× 20lb Top-Loaders (quick turns, budget customers)
- 12× 30lb Front-Loaders (bread & butter)
- 6× 40lb Front-Loaders (comforters, families)
- 4× 60lb Front-Loaders (premium, bulk)
- 2× 80lb Front-Loaders (commercial accounts)

**Dryers:**
- 32× 30lb Gas Dryers (standard)
- 24× 45lb Gas Dryers (large loads)
- 8× 75lb Gas Dryers (commercial)

**Key Insight:** 2:1 dryer-to-washer ratio (gas). Would be 2.5:1 for electric.

## The Equipment ROI Calculator

Average equipment costs:
- 20lb washer: $2,500
- 30lb washer: $4,000
- 60lb washer: $8,500
- 30lb dryer: $1,800

[Embed Equipment ROI Calculator]

## Speed Queen vs. Dexter vs. Continental Girbau

**Speed Queen:**
- Pros: Bulletproof reliability, easy parts
- Cons: Higher upfront cost
- Best for: Owner-operators prioritizing uptime

**Dexter:**
- Pros: Lower cost, good performance
- Cons: More maintenance required
- Best for: Budget-conscious starts

**Continental Girbau:**
- Pros: Energy efficient, large capacities
- Cons: Specialized parts, longer lead times
- Best for: High-volume operations

## Capacity Planning Formula

\`\`\`
Washers Needed = (Renter Households ÷ 250) rounded up
\`\`\`

Example: 2,000 households ÷ 250 = 8 washers minimum

**Pro Tip:** Start with minimum capacity, add equipment based on actual demand patterns. It's easier to add than remove.
          `,
          quiz: {
            questions: [
              {
                id: 'q1',
                question: 'What is the ideal dryer-to-washer ratio for GAS dryers?',
                type: 'multiple_choice',
                options: ['1:1', '1.5:1', '2:1', '3:1'],
                correctAnswer: 2,
                explanation: '2:1 for gas dryers, 2.5:1 for electric. Dryers take longer than washers, so you need more to prevent bottlenecks.',
                points: 10
              },
              {
                id: 'q2',
                question: 'How many washers should you have per 200-300 renter households?',
                type: 'multiple_choice',
                options: ['0.5 washers', '1 washer', '2 washers', '5 washers'],
                correctAnswer: 1,
                explanation: '1 washer per 200-300 households is the industry standard for capacity planning.',
                points: 10
              }
            ]
          },
          calculatorEmbed: {
            type: 'equipment-roi-calculator',
            config: {}
          }
        }
      }
    ]
  },

  {
    id: 'location-mastery',
    title: 'Location & Site Selection Mastery',
    description: 'The deep dive into finding, evaluating, and securing perfect laundromat locations. Includes traffic analysis, parking calculations, and lease negotiation tactics.',
    category: 'location',
    difficulty: 'intermediate',
    price: '147.00',
    discountPrice: '97.00',
    duration: 360,
    instructor: 'Nicholas Kremers',
    published: true,
    featured: true,
    lessons: []
  },

  {
    id: 'financial-mastery',
    title: 'Financial Mastery: ROI, Valuation & Pro Formas',
    description: 'Learn to analyze deals like a pro. Build accurate pro formas, calculate true ROI, and value laundromats using industry multiples. Includes real P&Ls from $30K and $90K/month stores.',
    category: 'finance',
    difficulty: 'intermediate',
    price: '197.00',
    discountPrice: '127.00',
    duration: 420,
    instructor: 'Nicholas Kremers & CPA Team',
    published: true,
    featured: false,
    lessons: []
  },

  {
    id: 'operations-excellence',
    title: 'Operations Excellence: Systems & Automation',
    description: 'Transform from operator to owner. Build systems for cleaning, maintenance, customer service, and vendor management. Includes SOP templates and automation playbooks.',
    category: 'operations',
    difficulty: 'intermediate',
    price: '127.00',
    discountPrice: '87.00',
    duration: 300,
    instructor: 'Nicholas Kremers',
    published: true,
    featured: false,
    lessons: []
  },

  {
    id: 'marketing-that-works',
    title: 'Marketing That Actually Works',
    description: 'No fluff. Real strategies that fill washers: Grand opening blueprints, loyalty programs, wash-dry-fold services, and commercial account acquisition.',
    category: 'marketing',
    difficulty: 'beginner',
    price: '97.00',
    discountPrice: '67.00',
    duration: 240,
    instructor: 'Nicholas Kremers',
    published: true,
    featured: false,
    lessons: []
  },

  {
    id: 'multi-store-expansion',
    title: 'The Multi-Store Mindset: Scaling to 5-10 Locations',
    description: 'Advanced strategies for scaling beyond one store. Includes hiring managers, remote monitoring, multi-location financing, and portfolio management.',
    category: 'scaling',
    difficulty: 'advanced',
    price: '297.00',
    discountPrice: '197.00',
    duration: 480,
    instructor: 'Nicholas Kremers & Ryan Smith',
    published: true,
    featured: false,
    lessons: []
  }
];

export default LAUNDROMAT_BIBLE_COURSES;

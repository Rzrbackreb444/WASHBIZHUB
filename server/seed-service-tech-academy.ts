import { db } from "./db";
import { serviceTechCourses, serviceTechModules, serviceTechLessons } from "@shared/schema";

interface CourseData {
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  track: string;
  level: string;
  isFree: boolean;
  requiredTier: string;
  estimatedHours: number;
  hasCertification: boolean;
  certificationName?: string;
  status: string;
  modules: {
    title: string;
    description: string;
    moduleType: string;
    lessons: {
      title: string;
      slug: string;
      content: string;
      isFreePreview: boolean;
      linkedDiagnosticCodes?: string[];
    }[];
  }[];
}

const ACADEMY_COURSES: CourseData[] = [
  // ═══════════════════════════════════════════════════════════════════
  // CORE TECH TRACK - Foundation skills for all technicians
  // ═══════════════════════════════════════════════════════════════════
  {
    slug: "commercial-laundry-fundamentals",
    title: "Commercial Laundry Fundamentals",
    description: "Master the essential knowledge every commercial laundry technician needs. Learn the anatomy of washers and dryers, understand electrical and plumbing systems, and develop a systematic troubleshooting approach that will save you time on every service call.",
    shortDescription: "Essential foundation for all commercial laundry technicians",
    track: "core_tech",
    level: "beginner",
    isFree: true,
    requiredTier: "free",
    estimatedHours: 4,
    hasCertification: true,
    certificationName: "WashBizHub Fundamentals Certificate",
    status: "published",
    modules: [
      {
        title: "Introduction to Commercial Laundry Equipment",
        description: "Understanding the commercial laundry landscape",
        moduleType: "standard",
        lessons: [
          {
            title: "Commercial vs Residential: Why It Matters",
            slug: "commercial-vs-residential",
            content: `# Commercial vs Residential Equipment

Commercial laundry equipment is built for a fundamentally different purpose than what you'd find in a home. Understanding these differences is crucial for proper service.

## Key Differences

### Volume & Durability
- Commercial washers: 8-15 cycles per day vs residential 1-2
- Heavy-duty bearings, motors, and suspension systems
- Industrial-grade stainless steel drums

### Electrical Systems
- 208V/240V three-phase power common
- Higher amperage requirements (30-50A typical)
- More complex control boards with multiple inputs

### Water Systems
- High-flow inlet valves (4-8 GPM vs 2-3 GPM residential)
- Multiple temperature mixing options
- Chemical injection systems (OPL operations)

### Payment Systems
- Coin drops, card readers, mobile payment integration
- Revenue tracking and reporting
- Network connectivity for remote monitoring

## Why This Matters for Technicians

Understanding these differences helps you:
1. Diagnose problems faster by knowing what's different
2. Order correct parts (commercial parts ≠ residential)
3. Set proper customer expectations on repair costs
4. Ensure safety with higher voltage systems

**SAFETY NOTE:** Commercial equipment operates at higher voltages with more powerful motors. Always verify zero energy state before servicing.`,
            isFreePreview: true
          },
          {
            title: "Major Manufacturers Overview",
            slug: "major-manufacturers",
            content: `# Major Commercial Laundry Manufacturers

Knowing the major players helps you understand parts availability, common failure patterns, and technical resources.

## Alliance Laundry Systems (Largest Global Manufacturer)
**Brands:** Speed Queen, Huebsch, UniMac, Primus, IPSO

- Headquartered in Ripon, Wisconsin
- Controls ~50% of North American commercial laundry market
- Parts available through Alliance Parts network
- Common platforms across brands (similar error codes)

## Dexter Laundry
- Family-owned, Fairfield, Iowa
- Strong in coin-operated segment
- Known for C-Series (coin) and T-Series equipment
- Excellent parts availability

## Electrolux Professional
- Swedish company, global presence
- W-Series washers, T-Series dryers
- Strong in healthcare and hospitality
- Growing OPL (on-premise laundry) focus

## Miele Professional
- German engineering, premium segment
- Smaller footprint equipment
- Higher price point, excellent reliability
- Limited technician network

## ADC (American Dryer Corporation)
- Dryer specialist (no washers)
- Strong in route operator market
- AD-Series with S.A.F.E. technology
- Now owned by Alliance Laundry Systems

## LG Commercial
- Growing segment from Korean giant
- Giant-C and Titan-C series
- Competitive pricing
- Smaller technician base

## Payment System Manufacturers
- **Greenwald Industries:** Smart card and coin systems
- **PayRange:** Mobile payment pioneers
- **Nayax:** Credit card and mobile solutions
- **ESD/CCI:** Card readers and acceptors`,
            isFreePreview: true
          },
          {
            title: "Essential Tools for Commercial Laundry Service",
            slug: "essential-tools",
            content: `# Essential Tools for Commercial Laundry Service

A well-equipped technician can handle 95% of service calls. Here's what you need.

## Electrical Testing Equipment

### Multimeter (REQUIRED)
- Fluke 117 or equivalent recommended
- Must measure AC/DC voltage, resistance, continuity
- Used on virtually every call

### Clamp Meter
- Measures current without disconnection
- Essential for motor and heater diagnostics
- Fluke 325 or equivalent

### NCVT (Non-Contact Voltage Tester)
- Quick safety check for live circuits
- Always verify with multimeter after
- Fluke 1AC or equivalent

## Mechanical Tools

### Screwdrivers
- Phillips #1, #2, #3
- Flat 1/4", 5/16", 3/8"
- Nut drivers 1/4", 5/16", 3/8", 7/16", 1/2"

### Wrenches
- Adjustable 8" and 12"
- Combination set 7mm-19mm (metric equipment)
- Combination set 1/4"-3/4" (domestic)

### Specialty Tools
- Coin box keys (Speed Queen, Dexter, etc.)
- Bearing puller set
- Seal installation tools
- Pump filter wrench

## Plumbing Tools
- Inlet valve screen picks
- Hose clamp pliers
- Channel locks (2 pairs)

## Safety Equipment (NON-NEGOTIABLE)
- Safety glasses
- Insulated gloves (rated for voltage)
- Steel-toe boots
- Hearing protection (dryer work)

## Pro Tips
1. Keep backup fuses in your van - they're cheap insurance
2. Label your meter leads and replace annually
3. Invest in quality - cheap tools fail when you need them most`,
            isFreePreview: false
          }
        ]
      },
      {
        title: "Washer Anatomy & Operation",
        description: "How commercial washers work from fill to spin",
        moduleType: "standard",
        lessons: [
          {
            title: "The Wash Cycle: Step by Step",
            slug: "wash-cycle-explained",
            content: `# The Wash Cycle: Step by Step

Understanding the wash cycle helps you pinpoint exactly where failures occur.

## Phase 1: Fill
1. Control board activates inlet valve(s)
2. Water flows through screens into tub
3. Pressure switch/transducer monitors water level
4. When target level reached, valve closes

**Common Failures:**
- Clogged inlet screens (most common - 40% of fill errors)
- Inlet valve coil failure
- Pressure switch/transducer failure
- Low water pressure (<20 PSI)

## Phase 2: Wash (Agitate/Tumble)
1. Motor activates at low speed
2. Drum rotates in alternating directions
3. Detergent mixes with water and clothes
4. Heater may activate for hot wash

**Common Failures:**
- Belt slip or break
- Motor overload (overloaded machine)
- Motor capacitor failure (top-load)
- Inverter/VFD failure (front-load)

## Phase 3: Drain
1. Drain pump or valve activates
2. Water pumped/gravity-fed to standpipe
3. Pressure switch confirms empty
4. Timeout if not empty in 4-8 minutes

**Common Failures:**
- Clogged pump filter/coin trap (most common - 70%)
- Pump motor failure
- Kinked drain hose
- Standpipe too deep

## Phase 4: Spin
1. High-speed rotation extracts water
2. Balance sensing prevents damage
3. Multiple spin speeds common
4. Door remains locked during spin

**Common Failures:**
- Unbalance errors (load distribution)
- Shock absorber wear
- Bearing failure (noise, vibration)
- Door lock issues (safety interlock)

## Phase 5: Unlock
1. Motor stops completely
2. Brief pause for drum stop
3. Door lock disengages
4. Cycle complete signal

**Common Failures:**
- Door unlock solenoid failure
- Mechanical binding
- Control board timing issue`,
            isFreePreview: false
          },
          {
            title: "Electrical Systems Deep Dive",
            slug: "washer-electrical-systems",
            content: `# Washer Electrical Systems

Understanding the electrical system is essential for safe and effective troubleshooting.

## Power Input

### Single Phase (Most Common)
- 208V or 240V AC
- Two hot legs + ground
- 20-30A breaker typical

### Three Phase (Larger Machines)
- 208V or 480V
- Three hot legs + ground
- Industrial installations only

## Control Board Architecture

### Main Control Board
- Receives all inputs (switches, sensors)
- Executes programmed cycles
- Controls all outputs (valves, motor, door lock)

### User Interface Board
- Display and button input
- Connected via ribbon cable
- Simpler replacement than main board

### Motor Control (Inverter/VFD)
- Variable frequency drive for motor speed
- Converts AC to DC to variable AC
- Expensive component ($200-400)

## Key Sensors & Inputs

| Sensor | Function | Typical Resistance |
|--------|----------|-------------------|
| Door Switch | Safety interlock | 0Ω closed, OL open |
| Pressure Switch | Water level | Contacts change with pressure |
| Thermistor | Water temp | 10kΩ @ 77°F (varies with temp) |
| Tachometer | Motor speed | Pulse signal to board |

## Safety Interlocks

Commercial machines have multiple safety systems:
1. Door lock - prevents opening during spin
2. Lid switch - prevents operation with open lid
3. Overflow switch - emergency water shutoff
4. Motor thermal protector - prevents overheating

**CRITICAL:** Never bypass safety interlocks. They exist to prevent injuries.`,
            isFreePreview: false,
            linkedDiagnosticCodes: ["Er_dL", "Er_do", "E01"]
          }
        ]
      },
      {
        title: "Systematic Troubleshooting",
        description: "The 5-step diagnostic process used by pros",
        moduleType: "standard",
        lessons: [
          {
            title: "The 5-Step Diagnostic Process",
            slug: "five-step-diagnostic",
            content: `# The 5-Step Diagnostic Process

Expert technicians don't guess - they follow a systematic process that works every time.

## Step 1: Gather Information

Before touching anything:
- What is the exact symptom?
- When did it start?
- Is it intermittent or constant?
- What error code is displayed?
- Has anything changed recently?

**Pro Tip:** Listen to the operator - they see the machine every day.

## Step 2: Verify the Problem

Don't take anyone's word for it:
- Observe the failure yourself
- Run a test cycle if possible
- Note exactly when in the cycle it fails
- Check for patterns (every cycle vs random)

**Pro Tip:** Some "failures" are user error or overloading.

## Step 3: Analyze the Symptom

Use your knowledge:
- What systems are involved in this phase?
- What error code tells us about the failure?
- What are the most common causes? (Start here!)
- What's the cheapest fix? (Try it first)

**Pro Tip:** 80% of problems have one of 5 causes. Know them.

## Step 4: Test Components Systematically

Move from most likely to least likely:
- Visual inspection first (look for obvious damage)
- Electrical tests (continuity, voltage, resistance)
- Mechanical tests (movement, wear, leaks)
- Component swap if available

**Pro Tip:** Document your findings as you go.

## Step 5: Repair and Verify

Complete the job properly:
- Replace failed component
- Run full test cycle
- Verify error code cleared
- Educate operator on prevention
- Document repair for future reference

**Pro Tip:** Don't leave until you've seen a successful cycle.

## The Pro Mindset

"What's the simplest explanation that fits all the symptoms?"

Start simple. Work systematic. Get paid.`,
            isFreePreview: true
          }
        ]
      },
      {
        title: "Final Assessment",
        description: "Demonstrate your fundamental knowledge",
        moduleType: "certification_exam",
        lessons: [
          {
            title: "Fundamentals Certification Exam",
            slug: "fundamentals-exam",
            content: `# Fundamentals Certification Exam

This assessment tests your understanding of commercial laundry fundamentals.

**Passing Score:** 80%
**Time Limit:** 30 minutes
**Attempts:** Unlimited

Upon passing, you will receive the WashBizHub Fundamentals Certificate.

[EXAM PLACEHOLDER - Interactive quiz to be implemented]`,
            isFreePreview: false
          }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  // BRAND SPECIALIST TRACK - Speed Queen Certification
  // ═══════════════════════════════════════════════════════════════════
  {
    slug: "speed-queen-mastery",
    title: "Speed Queen Mastery Certification",
    description: "Become a Speed Queen expert. Master every error code, understand the Quantum control systems, and learn the diagnostic procedures used by Alliance-certified technicians. This course covers all commercial Speed Queen washers and dryers from 2000-2025.",
    shortDescription: "Complete Speed Queen diagnostic and repair mastery",
    track: "brand_specialist",
    level: "intermediate",
    isFree: false,
    requiredTier: "pro",
    estimatedHours: 12,
    hasCertification: true,
    certificationName: "Speed Queen Specialist Certificate",
    status: "published",
    modules: [
      {
        title: "Speed Queen Product Lines",
        description: "Understanding the Speed Queen ecosystem",
        moduleType: "standard",
        lessons: [
          {
            title: "Quantum Touch vs Quantum Gold vs Classic",
            slug: "quantum-systems-overview",
            content: `# Speed Queen Control Systems

Speed Queen has evolved through several control platforms. Knowing which system you're working on is essential.

## Quantum Touch (2015-Present)
- Full-color touchscreen interface
- Advanced diagnostics with on-screen guidance
- USB firmware updates
- Network connectivity options
- Most common in new installations

**Test Mode Entry:** Press and hold upper-left corner for 5 seconds

## Quantum Gold (2010-2018)
- LED display with button interface
- Robust control platform
- Good diagnostic capabilities
- Still widely installed

**Test Mode Entry:** Press "Delicates + Cold" simultaneously

## Classic Mechanical (Pre-2010)
- Timer-based controls
- Limited diagnostics
- Reliable but aging
- Parts becoming scarcer

**Diagnostics:** Rely on symptom-based troubleshooting

## Identifying Your Machine

### Serial Number Decoding
- First 2 digits: Year of manufacture
- Next letter: Month (A=Jan, B=Feb, etc.)
- Remaining digits: Production sequence

Example: 18B12345 = February 2018

### Model Number Prefixes
- SC/SW: Soft-mount washers
- UC/UW: UniMac-branded Speed Queen
- ST/SD: Stack dryers
- DR: Single-pocket dryers`,
            isFreePreview: true
          }
        ]
      },
      {
        title: "Speed Queen Error Codes - Complete Guide",
        description: "Every error code explained with fix procedures",
        moduleType: "hands_on",
        lessons: [
          {
            title: "Washer Error Codes A-Z",
            slug: "sq-washer-error-codes",
            content: `# Speed Queen Washer Error Codes

Complete reference for all Speed Queen washer error codes with diagnostic procedures.

## Door Errors

### Er_dL / E:dL - Door Lock Failure
**Meaning:** Door lock mechanism failed to engage
**Fix Rate:** 92% with these steps

**Diagnostic Steps:**
1. Power cycle - clears 40% of codes
2. Spray WD-40 on strike and latch
3. Check door closes completely
4. Test lock solenoid (20-40Ω expected)
5. Inspect wiring to J4 connector

**Parts:**
- F808214P Door Lock Solenoid - $65
- F808215P Door Strike Kit - $25

---

### Er_do / E:do - Door Open
**Meaning:** Door switch not detecting closed door
**Fix Rate:** 95% with these steps

**Diagnostic Steps:**
1. Verify door closes fully against seal
2. Test door switch continuity (should close)
3. Check door hinge alignment
4. Inspect wiring from switch to board

**Parts:**
- F840269P Door Switch - $45

---

## Drain Errors

### Er_dr / E:dr - Drain Error
**Meaning:** Water not draining within timeout
**Fix Rate:** 92% with these steps

**THE MONEY FIX:** Clean pump filter/coin trap - 70% success

**Diagnostic Steps:**
1. Locate coin trap (front panel, lower right)
2. Place towel under - water will spill
3. Remove cap and clear debris
4. If clear, check drain hose for kinks
5. Listen for pump - humming = debris; silent = motor

**Parts:**
- F802118P Drain Pump - $89
- F803506 Filter Screen - $12

---

[Continue for all codes...]`,
            isFreePreview: false,
            linkedDiagnosticCodes: ["Er_dL", "Er_dr", "Er_FL", "Er_Ub"]
          }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  // PAYMENT SYSTEMS TRACK
  // ═══════════════════════════════════════════════════════════════════
  {
    slug: "payment-systems-mastery",
    title: "Payment Systems Mastery",
    description: "Master coin drops, card readers, and mobile payment systems. Learn to diagnose Greenwald, PayRange, Nayax, and other payment systems. Reduce callback rates and increase first-time fix percentages on payment-related service calls.",
    shortDescription: "Coin, card, and mobile payment diagnostics",
    track: "payment_systems",
    level: "intermediate",
    isFree: false,
    requiredTier: "starter",
    estimatedHours: 6,
    hasCertification: true,
    certificationName: "Payment Systems Specialist Certificate",
    status: "published",
    modules: [
      {
        title: "Greenwald Smart Card Systems",
        description: "The most common payment system explained",
        moduleType: "standard",
        lessons: [
          {
            title: "Greenwald Error Codes & LED Patterns",
            slug: "greenwald-error-codes",
            content: `# Greenwald Smart Card System Diagnostics

Greenwald's SmartCard system is the most common payment system in coin laundries.

## LED Flash Codes

### 4 Slow Flashes
**Meaning:** Failed to Load User List
**Fix:** Update card reader with current location data

### 6 Fast Flashes
**Meaning:** Machine/Card ID Mismatch
**Fix:** Reseat white ID chip on reader board (30-second fix)

### 7 Fast Flashes
**Meaning:** Area Mismatch
**Fix:** Verify area codes match in reader configuration

### 9 Fast Flashes
**Meaning:** Failed Write to Reader Info
**Fix:** Replace EEPROM chip or reader board

### 10 Slow Flashes
**Meaning:** Failed Write Transaction
**Fix:** Check memory capacity, may need service

## Chip/Card Errors

### E1 - Unable to Read Chip
**Common Causes:**
- Dirty chip contacts (clean with eraser)
- Damaged card
- Reader head dirty

### E2 - Chip Not Responding
**Fix:** Antenna coil issue - check connections

### E3 - Wrong Customer ID
**Fix:** Card programmed for different location

### E4 - Location Mismatch
**Fix:** Configuration error - reprogram reader

### E5 - Card Uses Exhausted
**Fix:** Card needs reload at value station

### E6 - Validation Failed
**Fix:** Security code mismatch - contact Greenwald support

## Pro Tips
1. Always try reseating the white ID chip first - free fix
2. Keep spare chips in your van
3. Update firmware before replacing hardware`,
            isFreePreview: true
          }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS SKILLS TRACK
  // ═══════════════════════════════════════════════════════════════════
  {
    slug: "service-business-bootcamp",
    title: "Service Business Bootcamp",
    description: "Build a profitable laundry service business. Learn pricing strategies, customer management, route optimization, and how to scale from solo tech to multi-truck operation. Includes real-world financials and templates.",
    shortDescription: "Turn technical skills into business profits",
    track: "business_skills",
    level: "advanced",
    isFree: false,
    requiredTier: "pro",
    estimatedHours: 8,
    hasCertification: true,
    certificationName: "Service Business Professional",
    status: "published",
    modules: [
      {
        title: "Pricing Your Services",
        description: "Charge what you're worth",
        moduleType: "standard",
        lessons: [
          {
            title: "The $289 Minimum Call Strategy",
            slug: "minimum-call-strategy",
            content: `# The $289 Minimum Call Strategy

Most technicians undercharge. Here's how to price profitably.

## The Math That Changes Everything

**Your Real Costs Per Call:**
- Drive time: 30 min average
- On-site time: 45 min average
- Parts pickup: 20 min (some calls)
- Invoicing/admin: 10 min
- **Total time investment: 1.5-2 hours**

If you want to make $75/hour:
- 2 hours × $75 = $150 minimum labor
- Plus van costs ($0.58/mile × 20 miles = $12)
- Plus insurance/overhead allocation: $25
- Plus parts margin: $50-100
- **Minimum profitable call: $237-287**

Round up to $289 for clean pricing.

## Why $289 Works

1. **Professional positioning** - Low prices signal low quality
2. **Covers all costs** - No "losing" calls
3. **Client qualification** - Serious owners pay, time-wasters don't
4. **Profit margin** - Allows for slow weeks

## Objection Handling

"That seems expensive..."

Response: "I understand. Many clients tell me they called three techs before me and still had the problem. I fix it right the first time, and that's why my clients stay with me. Would you like to schedule the repair?"

## Parts Markup Strategy

| Part Cost | Markup | Sell Price |
|-----------|--------|------------|
| $0-25 | 300% | $25-100 |
| $26-75 | 200% | $78-225 |
| $76-150 | 150% | $190-375 |
| $151+ | 100% | $302+ |

Nobody checks Alliance list prices. Charge for your expertise.`,
            isFreePreview: true
          }
        ]
      }
    ]
  }
];

export async function seedServiceTechAcademy() {
  console.log("Seeding Service Tech Academy courses...");

  for (const course of ACADEMY_COURSES) {
    try {
      // Insert course
      const [insertedCourse] = await db.insert(serviceTechCourses).values({
        slug: course.slug,
        title: course.title,
        description: course.description,
        shortDescription: course.shortDescription,
        track: course.track,
        level: course.level,
        isFree: course.isFree,
        requiredTier: course.requiredTier,
        estimatedHours: course.estimatedHours,
        lessonCount: course.modules.reduce((acc, m) => acc + m.lessons.length, 0),
        hasCertification: course.hasCertification,
        certificationName: course.certificationName,
        status: course.status,
        publishedAt: course.status === "published" ? new Date() : null,
      }).onConflictDoNothing().returning();

      if (!insertedCourse) {
        console.log(`Course ${course.slug} already exists, skipping...`);
        continue;
      }

      console.log(`Created course: ${course.title}`);

      // Insert modules
      for (let moduleIndex = 0; moduleIndex < course.modules.length; moduleIndex++) {
        const module = course.modules[moduleIndex];
        
        const [insertedModule] = await db.insert(serviceTechModules).values({
          courseId: insertedCourse.id,
          title: module.title,
          description: module.description,
          orderIndex: moduleIndex,
          moduleType: module.moduleType,
        }).returning();

        // Insert lessons
        for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex++) {
          const lesson = module.lessons[lessonIndex];
          
          await db.insert(serviceTechLessons).values({
            moduleId: insertedModule.id,
            courseId: insertedCourse.id,
            title: lesson.title,
            slug: lesson.slug,
            content: lesson.content,
            orderIndex: lessonIndex,
            isFreePreview: lesson.isFreePreview,
            linkedDiagnosticCodes: lesson.linkedDiagnosticCodes || [],
          });
        }
      }
    } catch (error) {
      console.error(`Error seeding course ${course.slug}:`, error);
    }
  }

  console.log("Service Tech Academy seeding complete!");
}

// Run if called directly
seedServiceTechAcademy()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });

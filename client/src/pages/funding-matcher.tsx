import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, CheckCircle2 } from "lucide-react";
import fundingHeroImg from "@assets/WBH FUNDING MATCHER SEARCH IMAGE_1763780009740.png";

interface Lender {
  name: string;
  type: string;
  minLoan: number;
  maxLoan: number;
  avgRate: string;
  loanTypes: string[];
}

const lenders: Lender[] = [
  {
    name: "SBA 7(a) National Lender",
    type: "SBA 7(a)",
    minLoan: 50000,
    maxLoan: 5000000,
    avgRate: "6.5% - 9.5%",
    loanTypes: ["business-acquisition", "working-capital", "equipment"],
  },
  {
    name: "SBA 504 Commercial Real Estate",
    type: "SBA 504",
    minLoan: 125000,
    maxLoan: 5500000,
    avgRate: "5.5% - 7.5%",
    loanTypes: ["real-estate", "equipment"],
  },
  {
    name: "Community Development Financial Institution",
    type: "CDFI",
    minLoan: 10000,
    maxLoan: 250000,
    avgRate: "7.5% - 12%",
    loanTypes: ["business-acquisition", "working-capital", "equipment", "startup"],
  },
  {
    name: "Equipment Financing Specialist",
    type: "Equipment",
    minLoan: 5000,
    maxLoan: 500000,
    avgRate: "6% - 10%",
    loanTypes: ["equipment"],
  },
  {
    name: "Traditional Bank Business Loan",
    type: "Conventional",
    minLoan: 100000,
    maxLoan: 10000000,
    avgRate: "5% - 8%",
    loanTypes: ["business-acquisition", "real-estate", "working-capital"],
  },
  {
    name: "Startup & Microenterprise Fund",
    type: "Microloan",
    minLoan: 500,
    maxLoan: 50000,
    avgRate: "8% - 13%",
    loanTypes: ["startup", "working-capital", "equipment"],
  },
];

export default function FundingMatcher() {
  const [inputs, setInputs] = useState({
    loanAmount: "",
    loanPurpose: "",
    creditScore: "",
    timeInBusiness: "",
  });

  const [matches, setMatches] = useState<Lender[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(inputs.loanAmount) || 0;
    const purpose = inputs.loanPurpose;
    
    const matched = lenders.filter(lender => {
      const withinRange = amount >= lender.minLoan && amount <= lender.maxLoan;
      const matchesPurpose = !purpose || lender.loanTypes.includes(purpose);
      return withinRange && matchesPurpose;
    });

    setMatches(matched);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={fundingHeroImg} 
            alt="Find Funding for Your Commercial Laundry Business - WashBizHub"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <DollarSign className="h-12 sm:h-16 w-12 sm:w-16 text-accent mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4" data-testid="text-funding-title">
              Laundromat Funding Matcher
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/70" data-testid="text-funding-subtitle">
              Connect with SBA lenders, banks, and alternative financing sources tailored to your needs
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Find Your Perfect Lender</CardTitle>
            <CardDescription className="text-white/70">
              Answer a few questions to get matched with the best financing options
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="loanAmount" className="text-white/90 font-medium">
                    How much funding do you need?
                  </Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    placeholder="e.g., 250000"
                    value={inputs.loanAmount}
                    onChange={(e) => setInputs({ ...inputs, loanAmount: e.target.value })}
                    className="bg-white/20 border-white/30 text-white placeholder-white/50 mt-2"
                    required
                    data-testid="input-loan-amount"
                  />
                </div>

                <div>
                  <Label htmlFor="loanPurpose" className="text-white/90 font-medium">
                    What's the primary purpose?
                  </Label>
                  <Select value={inputs.loanPurpose} onValueChange={(val) => setInputs({ ...inputs, loanPurpose: val })}>
                    <SelectTrigger 
                      className="bg-white/20 border-white/30 text-white mt-2"
                      data-testid="select-loan-purpose"
                    >
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business-acquisition">Business Acquisition</SelectItem>
                      <SelectItem value="real-estate">Real Estate / Property</SelectItem>
                      <SelectItem value="equipment">Equipment Purchase</SelectItem>
                      <SelectItem value="working-capital">Working Capital</SelectItem>
                      <SelectItem value="startup">Startup Costs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="creditScore" className="text-white/90 font-medium">
                    Personal Credit Score (Estimate)
                  </Label>
                  <Select value={inputs.creditScore} onValueChange={(val) => setInputs({ ...inputs, creditScore: val })}>
                    <SelectTrigger 
                      className="bg-white/20 border-white/30 text-white mt-2"
                      data-testid="select-credit-score"
                    >
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent (720+)</SelectItem>
                      <SelectItem value="good">Good (680-719)</SelectItem>
                      <SelectItem value="fair">Fair (640-679)</SelectItem>
                      <SelectItem value="poor">Below 640</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timeInBusiness" className="text-white/90 font-medium">
                    Time in Business
                  </Label>
                  <Select value={inputs.timeInBusiness} onValueChange={(val) => setInputs({ ...inputs, timeInBusiness: val })}>
                    <SelectTrigger 
                      className="bg-white/20 border-white/30 text-white mt-2"
                      data-testid="select-time-in-business"
                    >
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Pre-Revenue / Startup</SelectItem>
                      <SelectItem value="1year">Less than 1 year</SelectItem>
                      <SelectItem value="2years">1-2 years</SelectItem>
                      <SelectItem value="3plus">3+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                  data-testid="button-find-lenders"
                >
                  Find Matching Lenders
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Your Matches</h3>
                  <Button 
                    variant="outline" 
                    onClick={() => setSubmitted(false)}
                    className="border-white/30 text-white hover:bg-white/10"
                    data-testid="button-start-over"
                  >
                    Start Over
                  </Button>
                </div>

                {matches.length > 0 ? (
                  <div className="space-y-4">
                    {matches.map((lender, idx) => (
                      <Card key={idx} className="bg-white/5 border-white/20" data-testid={`card-lender-${idx}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-white text-lg">{lender.name}</CardTitle>
                              <CardDescription className="text-white/60">{lender.type}</CardDescription>
                            </div>
                            <CheckCircle2 className="h-6 w-6 text-accent" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-white/60">Loan Range:</span>
                              <p className="text-white font-semibold">
                                ${(lender.minLoan / 1000).toFixed(0)}K - ${(lender.maxLoan / 1000000).toFixed(1)}M
                              </p>
                            </div>
                            <div>
                              <span className="text-white/60">Avg Interest Rate:</span>
                              <p className="text-white font-semibold">{lender.avgRate}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white/5 border-white/20">
                    <CardContent className="py-8 text-center">
                      <p className="text-white/70">
                        No direct matches found. Try adjusting your loan amount or contact our team for personalized guidance.
                      </p>
                    </CardContent>
                  </Card>
                )}

                <p className="text-sm text-white/60 text-center">
                  * Results are for informational purposes. Final approval depends on creditworthiness and lender underwriting.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

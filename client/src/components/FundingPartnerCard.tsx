import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, ExternalLink, Clock, CreditCard, Building2, 
  DollarSign, FileText, TrendingUp, Star, Shield, Zap, ArrowRight
} from "lucide-react";

export interface FundingPartnerRequirements {
  minCreditScore: string;
  timeInBusiness: string;
  minAnnualRevenue: string;
  downPayment: string;
}

export interface FundingPartnerLoanDetails {
  minAmount: string;
  maxAmount: string;
  termLength: string;
  approvalSpeed: string;
  interestRate?: string;
}

export interface FundingPartnerDocumentation {
  bankStatements: string;
  taxReturns: string;
  financials: string;
  other?: string[];
}

export interface FundingPartner {
  id: string;
  name: string;
  logo?: string;
  type: string;
  description: string;
  requirements: FundingPartnerRequirements;
  loanDetails: FundingPartnerLoanDetails;
  documentation: FundingPartnerDocumentation;
  bestFor: string[];
  alsoOffers?: string[];
  affiliateUrl: string;
  isPrimary?: boolean;
  specialFeature?: string;
  trustSignals?: string[];
  detailPageUrl?: string;
}

interface FundingPartnerCardProps {
  partner: FundingPartner;
  onApply: (partner: FundingPartner) => void;
  variant?: "default" | "compact" | "detailed";
  showDocumentation?: boolean;
}

export function FundingPartnerCard({ 
  partner, 
  onApply, 
  variant = "default",
  showDocumentation = false 
}: FundingPartnerCardProps) {
  const { requirements, loanDetails, documentation } = partner;

  if (variant === "compact") {
    return (
      <Card className={`relative bg-card border shadow-sm overflow-hidden transition-all hover-elevate ${partner.isPrimary ? 'ring-2 ring-[#C8A661]' : ''}`}>
        <div className="h-1 bg-[#C8A661]" />
        {partner.isPrimary && (
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-[#C8A661] text-[#0A1628]">
              <Star className="w-3 h-3 mr-1" /> Recommended
            </Badge>
          </div>
        )}
        <CardContent className="p-4 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-foreground">{partner.name}</h3>
              <p className="text-sm text-muted-foreground">{partner.type}</p>
              {partner.specialFeature && (
                <Badge variant="outline" className="mt-2 text-[#C8A661] border-[#C8A661]/30">
                  <Zap className="w-3 h-3 mr-1" /> {partner.specialFeature}
                </Badge>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-[#C8A661]">{loanDetails.minAmount} - {loanDetails.maxAmount}</div>
              <div className="text-xs text-muted-foreground">{loanDetails.approvalSpeed}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
            <div className="flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-muted-foreground" />
              <span>{requirements.minCreditScore} credit</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span>{requirements.timeInBusiness}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <Button 
              onClick={() => onApply(partner)} 
              className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
              data-testid={`apply-${partner.id}`}
            >
              Get Pre-Qualified <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            {partner.detailPageUrl && (
              <Link href={partner.detailPageUrl}>
                <Button 
                  variant="outline"
                  className="w-full"
                  size="sm"
                  data-testid={`learn-more-${partner.id}`}
                >
                  Learn More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`relative bg-card border shadow-sm overflow-hidden transition-all hover-elevate ${partner.isPrimary ? 'ring-2 ring-[#C8A661]' : ''}`}>
      <div className="h-1 bg-[#C8A661]" />
      {partner.isPrimary && (
        <div className="absolute top-6 left-6 z-10">
          <Badge className="bg-[#C8A661] text-[#0A1628] shadow-sm">
            <Star className="w-3 h-3 mr-1" /> Recommended Partner
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-2 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className={partner.isPrimary ? "pt-8" : ""}>
            <h3 className="font-bold text-xl text-foreground">{partner.name}</h3>
            <p className="text-sm text-muted-foreground">{partner.type}</p>
          </div>
          {partner.specialFeature && (
            <Badge variant="outline" className="text-[#C8A661] border-[#C8A661]/30 whitespace-nowrap">
              <Zap className="w-3 h-3 mr-1" /> {partner.specialFeature}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{partner.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide flex items-center gap-1">
              <Shield className="w-3 h-3" /> Qualification Requirements
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-[#C8A661]" />
                <span className="text-muted-foreground">Credit Score:</span>
                <span className="font-medium text-foreground">{requirements.minCreditScore}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-[#C8A661]" />
                <span className="text-muted-foreground">Time in Business:</span>
                <span className="font-medium text-foreground">{requirements.timeInBusiness}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-[#C8A661]" />
                <span className="text-muted-foreground">Annual Revenue:</span>
                <span className="font-medium text-foreground">{requirements.minAnnualRevenue}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-[#C8A661]" />
                <span className="text-muted-foreground">Down Payment:</span>
                <span className="font-medium text-foreground">{requirements.downPayment}</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Loan Details
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-[#C8A661]">{loanDetails.minAmount} - {loanDetails.maxAmount}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Term:</span>
                <span className="font-medium text-foreground">{loanDetails.termLength}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Approval:</span>
                <span className="font-medium text-[#C8A661]">{loanDetails.approvalSpeed}</span>
              </div>
              {loanDetails.interestRate && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Rate:</span>
                  <span className="font-medium text-foreground">{loanDetails.interestRate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {showDocumentation && (
          <div className="pt-3 border-t">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide flex items-center gap-1 mb-2">
              <FileText className="w-3 h-3" /> Documentation Required
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#C8A661]" />
                <span className="text-muted-foreground">{documentation.bankStatements} Bank Statements</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#C8A661]" />
                <span className="text-muted-foreground">{documentation.taxReturns} Tax Returns</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#C8A661]" />
                <span className="text-muted-foreground">{documentation.financials}</span>
              </div>
              {documentation.other?.map((doc, i) => (
                <div key={i} className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#C8A661]" />
                  <span className="text-muted-foreground">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1 pt-2">
          {partner.bestFor.map((item, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" /> {item}
            </Badge>
          ))}
        </div>

        {partner.trustSignals && partner.trustSignals.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {partner.trustSignals.map((signal, i) => (
              <span key={i} className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#C8A661]" /> {signal}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => onApply(partner)} 
            className="flex-1 bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
            size="lg"
            data-testid={`apply-${partner.id}`}
          >
            Get Pre-Qualified in {loanDetails.approvalSpeed.includes("Same") ? "Minutes" : loanDetails.approvalSpeed}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          {partner.detailPageUrl && (
            <Link href={partner.detailPageUrl}>
              <Button 
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                data-testid={`learn-more-${partner.id}`}
              >
                Learn More <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function FundingPartnerComparisonTable({ 
  partners, 
  onApply 
}: { 
  partners: FundingPartner[], 
  onApply: (partner: FundingPartner) => void 
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-semibold text-foreground">Partner</th>
            <th className="text-left p-3 font-semibold text-foreground">Credit Score</th>
            <th className="text-left p-3 font-semibold text-foreground">Time in Business</th>
            <th className="text-left p-3 font-semibold text-foreground">Revenue</th>
            <th className="text-left p-3 font-semibold text-foreground">Amount</th>
            <th className="text-left p-3 font-semibold text-foreground">Approval</th>
            <th className="text-left p-3 font-semibold text-foreground"></th>
          </tr>
        </thead>
        <tbody>
          {partners.map((partner) => (
            <tr key={partner.id} className="border-b hover:bg-muted/30">
              <td className="p-3">
                <div className="font-medium text-foreground">{partner.name}</div>
                <div className="text-xs text-muted-foreground">{partner.type}</div>
              </td>
              <td className="p-3 text-muted-foreground">{partner.requirements.minCreditScore}</td>
              <td className="p-3 text-muted-foreground">{partner.requirements.timeInBusiness}</td>
              <td className="p-3 text-muted-foreground">{partner.requirements.minAnnualRevenue}</td>
              <td className="p-3 text-[#C8A661] font-medium">{partner.loanDetails.minAmount} - {partner.loanDetails.maxAmount}</td>
              <td className="p-3">
                <Badge variant="outline" className="text-[#C8A661] border-[#C8A661]/30">
                  {partner.loanDetails.approvalSpeed}
                </Badge>
              </td>
              <td className="p-3">
                <Button 
                  size="sm" 
                  onClick={() => onApply(partner)}
                  className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                  data-testid={`table-apply-${partner.id}`}
                >
                  Apply
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FundingQualifierQuiz({
  onComplete
}: {
  onComplete: (qualifiedPartners: FundingPartner[], userProfile: UserFundingProfile) => void
}) {
  return null;
}

export interface UserFundingProfile {
  creditScore: string;
  timeInBusiness: string;
  annualRevenue: string;
  downPaymentAvailable: string;
  fundingPurpose: string;
}

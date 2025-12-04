import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, ExternalLink, Clock, CreditCard, Building2, 
  DollarSign, FileText, TrendingUp, Star, Shield, Zap
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
      <Card className={`relative overflow-visible transition-all hover-elevate ${partner.isPrimary ? 'ring-2 ring-[#b8860b]' : ''}`}>
        {partner.isPrimary && (
          <div className="absolute -top-3 left-4">
            <Badge className="bg-[#b8860b] text-white">
              <Star className="w-3 h-3 mr-1" /> Recommended
            </Badge>
          </div>
        )}
        <CardContent className="p-4 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-[#1e3a5f]">{partner.name}</h3>
              <p className="text-sm text-muted-foreground">{partner.type}</p>
              {partner.specialFeature && (
                <Badge variant="outline" className="mt-2 text-[#b8860b] border-[#b8860b]">
                  <Zap className="w-3 h-3 mr-1" /> {partner.specialFeature}
                </Badge>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-[#b8860b]">{loanDetails.minAmount} - {loanDetails.maxAmount}</div>
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
          <Button 
            onClick={() => onApply(partner)} 
            className="w-full mt-4 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
            data-testid={`apply-${partner.id}`}
          >
            Get Pre-Qualified <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`relative overflow-visible transition-all hover-elevate ${partner.isPrimary ? 'ring-2 ring-[#b8860b]' : ''}`}>
      {partner.isPrimary && (
        <div className="absolute -top-3 left-4 z-10">
          <Badge className="bg-[#b8860b] text-white shadow-md">
            <Star className="w-3 h-3 mr-1" /> Recommended Partner
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-2 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-xl text-[#1e3a5f]">{partner.name}</h3>
            <p className="text-sm text-muted-foreground">{partner.type}</p>
          </div>
          {partner.specialFeature && (
            <Badge variant="outline" className="text-[#b8860b] border-[#b8860b] whitespace-nowrap">
              <Zap className="w-3 h-3 mr-1" /> {partner.specialFeature}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{partner.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide flex items-center gap-1">
              <Shield className="w-3 h-3" /> Qualification Requirements
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-[#b8860b]" />
                <span className="text-muted-foreground">Credit Score:</span>
                <span className="font-medium">{requirements.minCreditScore}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-[#b8860b]" />
                <span className="text-muted-foreground">Time in Business:</span>
                <span className="font-medium">{requirements.timeInBusiness}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-[#b8860b]" />
                <span className="text-muted-foreground">Annual Revenue:</span>
                <span className="font-medium">{requirements.minAnnualRevenue}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-[#b8860b]" />
                <span className="text-muted-foreground">Down Payment:</span>
                <span className="font-medium">{requirements.downPayment}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Loan Details
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">{loanDetails.minAmount} - {loanDetails.maxAmount}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Term:</span>
                <span className="font-medium">{loanDetails.termLength}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Approval:</span>
                <span className="font-medium text-green-600">{loanDetails.approvalSpeed}</span>
              </div>
              {loanDetails.interestRate && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Rate:</span>
                  <span className="font-medium">{loanDetails.interestRate}</span>
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
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span>{documentation.bankStatements} Bank Statements</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span>{documentation.taxReturns} Tax Returns</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span>{documentation.financials}</span>
              </div>
              {documentation.other?.map((doc, i) => (
                <div key={i} className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>{doc}</span>
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
                <Shield className="w-3 h-3 text-green-500" /> {signal}
              </span>
            ))}
          </div>
        )}

        <Button 
          onClick={() => onApply(partner)} 
          className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] hover:from-[#1e3a5f]/90 hover:to-[#2d5a8f]/90"
          size="lg"
          data-testid={`apply-${partner.id}`}
        >
          Get Pre-Qualified in {loanDetails.approvalSpeed.includes("Same") ? "Minutes" : loanDetails.approvalSpeed}
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
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
            <th className="text-left p-3 font-semibold">Partner</th>
            <th className="text-left p-3 font-semibold">Credit Score</th>
            <th className="text-left p-3 font-semibold">Time in Business</th>
            <th className="text-left p-3 font-semibold">Revenue</th>
            <th className="text-left p-3 font-semibold">Amount</th>
            <th className="text-left p-3 font-semibold">Approval</th>
            <th className="text-left p-3 font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          {partners.map((partner) => (
            <tr key={partner.id} className="border-b hover:bg-muted/30">
              <td className="p-3">
                <div className="font-medium">{partner.name}</div>
                <div className="text-xs text-muted-foreground">{partner.type}</div>
              </td>
              <td className="p-3">{partner.requirements.minCreditScore}</td>
              <td className="p-3">{partner.requirements.timeInBusiness}</td>
              <td className="p-3">{partner.requirements.minAnnualRevenue}</td>
              <td className="p-3">{partner.loanDetails.minAmount} - {partner.loanDetails.maxAmount}</td>
              <td className="p-3">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {partner.loanDetails.approvalSpeed}
                </Badge>
              </td>
              <td className="p-3">
                <Button 
                  size="sm" 
                  onClick={() => onApply(partner)}
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

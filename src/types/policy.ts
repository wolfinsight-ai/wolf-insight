export const PERSONAS = [
  "Investor / Family Office",
  "Renewable Energy Startup",
  "Biogas Plant Operator",
  "Climate Tech Companies",
  "Energy Consultants",
  "Corporate Strategy Teams",
  "Industry Association",
  "Policy Research Organization",
] as const;

export type Persona = (typeof PERSONAS)[number];

export const GOVERNMENT_SOURCES = [
  { id: "MNRE", label: "MNRE", fullName: "Ministry of New & Renewable Energy" },
  { id: "PIB", label: "PIB", fullName: "Press Information Bureau" },
  { id: "CERC", label: "CERC", fullName: "Central Electricity Regulatory Commission" },
  { id: "MoP", label: "Ministry of Power (MoP)", fullName: "Ministry of Power" },
  { id: "CEA", label: "CEA", fullName: "Central Electricity Authority" },
  { id: "SECI", label: "SECI", fullName: "Solar Energy Corporation of India" },
  { id: "IREDA", label: "IREDA", fullName: "Indian Renewable Energy Development Agency" },
  { id: "e-Gazette", label: "e-Gazette", fullName: "The Gazette of India (e-Gazette)" },
] as const;

export type GovernmentSourceId = (typeof GOVERNMENT_SOURCES)[number]["id"];

export const SECTORS = [
  "Solar & Manufacturing",
  "Biogas & CBG",
  "Grid & Open Access",
  "Green Hydrogen",
  "Storage (BESS)",
] as const;

export type Sector = (typeof SECTORS)[number];

export const POLICY_TYPES = [
  "Subsidy / Scheme",
  "Tariff Order",
  "Amendment",
  "Tender / Bid",
  "Compliance Guideline",
] as const;

export type PolicyType = (typeof POLICY_TYPES)[number];

export interface PolicyItem {
  id: string;
  title: string;
  source: GovernmentSourceId;
  sector: Sector;
  policyType: PolicyType;
  publishedDate: string; // YYYY-MM-DD
  relevanceScore: number; // 1-100
  pdfUrl: string;
  uploadedPdfName?: string;
  uploadedPdfSize?: number;
  referenceNumber?: string;
  executiveSummary: [string, string, string];
  isAmendment: boolean;
  oldRule?: string;
  newRule?: string;
  personaImpacts: Record<Persona, string>;
}

export type ActiveView = "feed" | "bookmarks" | "admin";
export type SortOrder = "latest" | "impact";

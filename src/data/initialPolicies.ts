import { PolicyItem } from "../types/policy";

export const INITIAL_POLICIES: PolicyItem[] = [
  {
    id: "pol-mnre-almm-list-ii-2026",
    title: "MNRE ALMM List-II Mandate for Domestic Solar PV Cells Across Utility & Open Access Projects",
    source: "MNRE",
    sector: "Solar & Manufacturing",
    policyType: "Amendment",
    publishedDate: "2026-10-28",
    relevanceScore: 96,
    pdfUrl: "https://mnre.gov.in/",
    referenceNumber: "F. No. 283/54/2018-GRID SOLAR (ALMM-II)",
    executiveSummary: [
      "Mandates sourcing solar PV cells exclusively from ALMM List-II domestic manufacturers for all government, net-metering, and C&I open-access projects post cut-off.",
      "Triggers an immediate supply squeeze on domestic TOPCon and Mono-PERC cell lines, lifting module BOM costs by an estimated ₹1.80–₹2.40/Wp in the near term.",
      "Protects pre-notified bids whose submission deadline preceded the official List-II enforcement trigger, avoiding stranded legacy PPAs.",
    ],
    isAmendment: true,
    oldRule:
      "ALMM List-I governed solar PV module origin only; Indian module assemblers could freely import imported solar cells (primarily from China and Southeast Asia) for domestic assembly and supply into ISTS and C&I projects.",
    newRule:
      "Projects under ALMM purview must deploy modules manufactured using domestically fabricated solar cells enlisted under ALMM List-II, subject to quarterly MNRE cell-capacity sufficiency verification.",
    personaImpacts: {
      "Investor / Family Office":
        "Strong equity tailwind for backward-integrated wafer/cell platforms (Waaree, Premier, Emmvee, Tata Power Solar). Re-underwrite standalone IPP IRR assumptions for 2027–28 COD pipelines by +150–200 bps capex sensitivity.",
      "Renewable Energy Startup":
        "C&I EPC and rooftop startups face working-capital lockups securing domestic cell allocations; asset-light developers should lock frame supply contracts with List-II cell-backed Tier-1 vendors immediately.",
      "Biogas Plant Operator":
        "Indirect grid power cost escalation for ancillary compression units if captive C&I solar tariffs firm up; prioritize self-consumption biogas gensets over third-party solar OA procurement.",
      "Climate Tech Companies":
        "High commercial demand for cell-level EL/IV defect inspection AI, domestic yield optimization SaaS, and automated BOM traceability ledgers for ALMM List-II compliance audits.",
      "Energy Consultants":
        "Immediate billable mandate to audit client PPA grandfathering eligibility, run bid-date cut-off legal reviews, and remodel LCOE curves with domestic cell price premiums.",
      "Corporate Strategy Teams":
        "RE100 industrial off-takers negotiating group captive solar PPAs should anticipate ₹0.25–₹0.35/kWh tariff firming on new bids and insert Change-in-Law protection clauses.",
      "Industry Association":
        "Urgent representation window to MNRE/CEA on phased cell-line commissioning buffers and pass-through mechanisms for state DISCOM tenders already bid prior to cell tightness.",
      "Policy Research Organization":
        "Key milestone testing India's PLI-backed solar supply chain resilience; monitor domestic cell utilization vs. polysilicon/wafer import dependence and pace of grid capacity addition.",
    },
  },
  {
    id: "pol-cerc-dsm-first-amendment-2026",
    title: "CERC Deviation Settlement Mechanism (DSM) First Amendment — Tightened RE Forecasting Bands",
    source: "CERC",
    sector: "Grid & Open Access",
    policyType: "Amendment",
    publishedDate: "2026-11-04",
    relevanceScore: 94,
    pdfUrl: "https://cercind.gov.in/",
    referenceNumber: "No. L-1/260/2022/CERC (DSM-Amd-I)",
    executiveSummary: [
      "Narrows error tolerance bands for ISTS-connected solar/hybrid generators to ±7% and standalone wind to ±10% per 15-minute time block.",
      "Links over-injection and under-injection penalty rates dynamically to Real-Time Market (RTM) Area Clearing Prices during peak grid-stress blocks.",
      "Incentivizes co-located BESS and sub-hourly meteorological nowcasting to shield project DSCR from merchant volatility.",
    ],
    isAmendment: true,
    oldRule:
      "ISTS wind and solar QCA pools operated under ±10% to ±15% deviation tolerance bands anchored to fixed PPA tariffs, capping financial penalties even during evening ramp deficits.",
    newRule:
      "Tolerance tightens to ±7% (solar/hybrid) and ±10% (wind), with deviations beyond band settled at tiered percentages of dynamic power exchange ACP/RTM clearing prices.",
    personaImpacts: {
      "Investor / Family Office":
        "Wind-heavy SPVs without QCA aggregation or BESS firming face 1.2%–2.4% EBITDA leakage; favor portfolios with proven forecasting accuracy (<5% RMSE) and hybrid storage hedging.",
      "Renewable Energy Startup":
        "Opens immediate enterprise sales velocity for AI weather-nowcasting, automated SCADA curtailment, and QCA pooling platforms targeting mid-market IPPs.",
      "Biogas Plant Operator":
        "Biogas-to-power plants supplying firm dispatchable blocks gain relative scheduling value in hybrid OA pools, creating upside for peak-hour power wheeling contracts.",
      "Climate Tech Companies":
        "Direct product-market pull for 15-minute block bidding engines, satellite cloud-vector telemetry, and automated battery dispatch controllers tied to IEX RTM feeds.",
      "Energy Consultants":
        "Strong advisory demand for historical 15-min block DSM penalty back-testing across client wind/solar fleets and optimal co-located BESS sizing studies.",
      "Corporate Strategy Teams":
        "Captive C&I consumers absorbing DSM pass-through under group-captive agreements should cap deviation liability in O&M/QCA SLAs at ≤2% of monthly billing.",
      "Industry Association":
        "Coordinate joint industry filings seeking gradual phase-in for legacy older-vintage wind turbines lacking pitch-control telemetry and standardized QCA pooling rules.",
      "Policy Research Organization":
        "Crucial grid-discipline shift as VRE penetration crosses 22% of peak generation; benchmark impact on IEX RTM liquidity and curtailment reduction across Rajasthan and Gujarat corridors.",
    },
  },
  {
    id: "pol-mop-geoa-rules-update-2026",
    title: "Ministry of Power Green Energy Open Access (GEOA) Rules Update — 15-Day Deemed Approval & ISTS Clarity",
    source: "MoP",
    sector: "Grid & Open Access",
    policyType: "Amendment",
    publishedDate: "2026-10-22",
    relevanceScore: 95,
    pdfUrl: "https://powermin.gov.in/",
    referenceNumber: "G.S.R. 642(E) — MoP GEOA Amendment",
    executiveSummary: [
      "Enforces strict 15-day deemed approval via the centralized national GEOA portal for all C&I consumers with ≥100 kW contracted demand.",
      "Standardizes monthly banking charges across SERCs at a uniform ceiling of 8% of banked green energy, curbing arbitrary state DISCOM surcharges.",
      "Clarifies 100% ISTS transmission charge waiver applicability for Green Hydrogen and Green Ammonia electrolyzers commissioned before December 2030.",
    ],
    isAmendment: true,
    oldRule:
      "State DISCOMs routinely delayed GEOA approvals beyond 45–60 days, imposed divergent state-specific banking restrictions, and left ambiguity around partial-load ISTS waivers for electrolyzers.",
    newRule:
      "Centralized 15-day deemed approval triggers automatically on the POSOCO/Grid-India portal; banking charges capped at ≤8% with mandatory monthly settlement and clear ISTS waiver continuity.",
    personaImpacts: {
      "Investor / Family Office":
        "De-risks C&I open-access platform cashflows in historically sticky states (Maharashtra, UP, Haryana), compressing project onboarding timelines from 6 months to under 45 days.",
      "Renewable Energy Startup":
        "Unlocks the fragmented SME C&I segment (100 kW–1 MW load) for digital PPA marketplaces, fractional solar subscriptions, and automated wheeling billing software.",
      "Biogas Plant Operator":
        "Facilities upgrading to bio-power or seeking green power for upgrading/compression equipment above 100 kW can now wheel low-cost solar OA power with predictable banking costs.",
      "Climate Tech Companies":
        "Green Hydrogen electrolyzer startups gain bankable ISTS transmission visibility through 2030, lowering delivered levelized cost of hydrogen (LCOH) by $0.35–$0.50/kg.",
      "Energy Consultants":
        "Immediate surge in multi-state C&I portfolio restructuring mandates to migrate commercial campuses and data centers from captive diesel/DISCOM tariffs to 100 kW+ GEOA.",
      "Corporate Strategy Teams":
        "Accelerates Scope 2 decarbonization across distributed manufacturing hubs, retail chains, and GCC offices previously blocked below the legacy 1 MW open-access threshold.",
      "Industry Association":
        "Track state SERC tariff-order alignment over the next 90 days to ensure state regulators update state open-access regulations without conflicting cross-subsidy surcharges.",
      "Policy Research Organization":
        "Evaluate DISCOM revenue erosion vs. industrial competitiveness gains; model cross-subsidy reform pathways as C&I migration accelerates.",
    },
  },
  {
    id: "pol-pib-gobardhan-cbg-cfa-2026",
    title: "GOBARdhan & SATAT Revised Central Financial Assistance (CFA) Guidelines for CBG & Bio-CNG Plants",
    source: "PIB",
    sector: "Biogas & CBG",
    policyType: "Subsidy / Scheme",
    publishedDate: "2026-10-19",
    relevanceScore: 92,
    pdfUrl: "https://pib.gov.in/",
    referenceNumber: "PIB Release ID 2084192 / MNRE-Bioenergy",
    executiveSummary: [
      "Sets CFA disbursement at ₹4 Crore per 4.8 TPD CBG production capacity (capped at ₹10 Crore per project) linked to verified gas injection milestones.",
      "Aligns mandatory 5% CBG Blending Obligation (CBO) ramp-up across City Gas Distribution (CGD) networks with standardized OMC off-take escalation pricing.",
      "Streamlines Fermented Organic Manure (FOM/LFOM) parity and Market Development Assistance (₹1,500/MT) under PM-PRANAM fertilizer channels.",
    ],
    isAmendment: false,
    personaImpacts: {
      "Investor / Family Office":
        "Improves unlevered project equity IRRs by 220–280 bps on 10–15 TPD agri-residue and press-mud CBG platforms, strengthening debt serviceability for IREDA/PSU bank term loans.",
      "Renewable Energy Startup":
        "Creates fast-scaling JV opportunities in decentralized feedstock aggregation, anaerobic digester IoT telemetry, and pipeline-injection skids for Tier-2 CGD operators.",
      "Biogas Plant Operator":
        "Direct cashflow relief: ₹4–10 Cr capital subsidy plus ₹1,500/MT FOM market support improves working capital liquidity; verify MNRE GOBARdhan portal registration immediately.",
      "Climate Tech Companies":
        "Rising demand for high-efficiency membrane/PSA biogas upgrading units, fugitive methane leak detection sensors, and carbon-credit MRV verification platforms.",
      "Energy Consultants":
        "High demand for bankable DPR preparation covering feedstock security contracts, FOM off-take tie-ups, and dual-revenue CBG + carbon credit financial modeling.",
      "Corporate Strategy Teams":
        "CGD companies and industrial thermal users (glass, ceramics, FMCG) can lock long-term CBO-compliant CBG supply via co-investment SPVs with guaranteed OMC parity.",
      "Industry Association":
        "Engage MoPNG and Department of Fertilizers to expedite quarterly MDA subsidy settlements for FOM/LFOM and standardize CGD pipeline tie-in fees.",
      "Policy Research Organization":
        "Critical test case for circular rural bio-economy economics; track stubble-burning abatement metrics in Punjab/Haryana vs. actual CBG capacity utilization.",
    },
  },
  {
    id: "pol-seci-ists-solar-bess-tender-2026",
    title: "SECI 2,000 MW ISTS-Connected Solar + 1,000 MW / 4,000 MWh BESS Tender (RfS Corrigendum-III)",
    source: "SECI",
    sector: "Storage (BESS)",
    policyType: "Tender / Bid",
    publishedDate: "2026-11-08",
    relevanceScore: 91,
    pdfUrl: "https://www.seci.co.in/",
    referenceNumber: "SECI/C&P/IPP/11/0024/2026-Corr-III",
    executiveSummary: [
      "Mandates 4-hour daily peak evening discharge (18:00–22:00 IST) with minimum 85% round-trip efficiency and 95% annual availability guarantee.",
      "Confirms stackability with VGF tranche support up to 30% of BESS capex for co-located lithium-iron-phosphate (LFP) storage blocks commissioned within 24 months.",
      "Extends bid submission and financial closure timelines by 45 days while revising Performance Bank Guarantee (PBG) release milestones.",
    ],
    isAmendment: false,
    personaImpacts: {
      "Investor / Family Office":
        "Peak-power FDRE/BESS tenders offer 13%–14.5% equity IRRs with sovereign-backed SECI counterparty credit; evaluate cell-augmentation reserves at Year 10–12 carefully.",
      "Renewable Energy Startup":
        "Opens subcontracting lanes for domestic BMS firmware, liquid-cooled LFP container integration, and EMS dispatch software vendors meeting CEA cybersecurity norms.",
      "Biogas Plant Operator":
        "Limited direct impact, though peak-evening tariff discovery (~₹4.80–₹5.40/kWh) sets the competitive benchmark for dispatchable renewable baseload procurement.",
      "Climate Tech Companies":
        "Strong commercial traction for battery degradation analytics, thermal runaway predictive diagnostics, and second-life EV cell repurposing validation.",
      "Energy Consultants":
        "Urgent modeling mandates for bidding consortia: optimize Solar DC-overbuilding ratios (1.4x–1.6x) against 4-hour LFP cycling degradation and VGF milestone triggers.",
      "Corporate Strategy Teams":
        "Benchmark tariff discovery from this SECI tender will reset C&I round-the-clock (RTC) corporate PPA expectations across steel, cement, and hyperscale data centers.",
      "Industry Association":
        "Advocate for clear customs duty parity on LFP battery cells until domestic Giga-factories reach commercial scale under the ACC PLI scheme.",
      "Policy Research Organization":
        "Landmark price-discovery indicator for 4-hour peak storage in India; analyze how VGF subsidies compress evening peak tariffs relative to imported coal/gas peakers.",
    },
  },
];

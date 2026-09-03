const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/User');
const Scheme = require('../models/Scheme');
const Application = require('../models/Application');
const MatchLog = require('../models/MatchLog');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hexagon';

/* ───────────────────────────────────────────────────────────────
   10 REAL GOVERNMENT SCHEMES — with actual eligibility rules,
   required documents, process steps, and rights statements
   ─────────────────────────────────────────────────────────────── */

const schemes = [
  {
    name: 'Stand-Up India',
    ministry: 'Ministry of Finance — Department of Financial Services',
    description: 'Facilitates bank loans between ₹10 lakh and ₹1 crore for greenfield enterprises in manufacturing, services, or trading sectors by SC, ST, and Women entrepreneurs.',
    schemeType: 'loan',
    eligibilityCriteria: {
      categories: ['SC', 'ST'],
      genders: ['Male', 'Female', 'Other'],
      ageRange: { min: 18, max: 65 },
      maxIncome: 0,
      businessStages: ['idea', 'startup'],
      sectors: ['manufacturing', 'services', 'trading'],
      locationTypes: ['rural', 'urban'],
      isGreenfield: true,
    },
    requiredDocs: [
      { name: 'Aadhaar Card', description: 'For identity verification', isMandatory: true },
      { name: 'Caste Certificate', description: 'Issued by competent district authority', isMandatory: true },
      { name: 'PAN Card', description: 'For tax identification', isMandatory: true },
      { name: 'Business Plan / Project Report', description: 'Detailed plan for the proposed enterprise', isMandatory: true },
      { name: 'Address Proof', description: 'Voter ID, utility bill, or passport', isMandatory: true },
      { name: 'Bank Account Details', description: 'For loan disbursement', isMandatory: true },
      { name: 'Passport-size Photographs', description: '2 recent photographs', isMandatory: true },
    ],
    benefits: {
      loanRange: { min: 1000000, max: 10000000 },
      subsidyPercent: 0,
      interestRate: 'Base rate + 3% + tenure premium',
      description: 'Composite loan (term loan + working capital) between ₹10 lakh and ₹1 crore for greenfield enterprises.'
    },
    processSteps: [
      { stepNumber: 1, title: 'Online Registration', description: 'Register on Stand-Up India portal (standupmitra.in)', estimatedDays: 1 },
      { stepNumber: 2, title: 'Bank Branch Visit', description: 'Visit the designated bank branch with documents', estimatedDays: 3 },
      { stepNumber: 3, title: 'Application Review', description: 'Bank reviews your project report and documents', estimatedDays: 15 },
      { stepNumber: 4, title: 'Credit Appraisal', description: 'Bank conducts credit assessment', estimatedDays: 10 },
      { stepNumber: 5, title: 'Loan Sanction', description: 'Loan sanctioned and communicated to applicant', estimatedDays: 5 },
      { stepNumber: 6, title: 'Disbursement', description: 'Loan amount disbursed to bank account', estimatedDays: 7 },
    ],
    applicantRights: [
      {
        right: 'This loan is legally collateral-free under CGTMSE guarantee.',
        explanation: 'The Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE) provides the guarantee cover. No bank can demand personal collateral, property mortgage, or third-party guarantee for this loan.',
        escalationPath: 'Branch Manager → Lead District Manager → SLBC → DFS Nodal Officer'
      },
      {
        right: 'Each bank branch must facilitate at least 1 SC/ST and 1 woman entrepreneur loan per year.',
        explanation: 'This is a mandatory directive under the Stand-Up India scheme guidelines. If a branch says they have "exhausted their quota," they are in violation.',
        escalationPath: 'Branch Manager → Regional Manager → standupmitra.in grievance portal'
      },
      {
        right: 'You have the right to a written reason if your application is rejected.',
        explanation: 'RBI Master Circular on Loans mandates that banks must communicate the reason for rejection in writing. Verbal refusals without documentation are not acceptable.',
        escalationPath: 'Branch Manager → Banking Ombudsman → DFS'
      }
    ],
    isActive: true,
  },
  {
    name: 'MUDRA Yojana — Shishu',
    ministry: 'Ministry of Finance',
    description: 'Micro-enterprise loans up to ₹50,000 for startup and early-stage businesses under Pradhan Mantri MUDRA Yojana.',
    schemeType: 'loan',
    eligibilityCriteria: {
      categories: ['SC', 'ST', 'OBC', 'General', 'Minority'],
      genders: ['Male', 'Female', 'Other'],
      ageRange: { min: 18, max: 65 },
      maxIncome: 0,
      businessStages: ['idea', 'startup'],
      sectors: ['manufacturing', 'services', 'trading'],
      locationTypes: ['rural', 'urban'],
    },
    requiredDocs: [
      { name: 'Aadhaar Card', description: 'Identity verification', isMandatory: true },
      { name: 'PAN Card', description: 'If available', isMandatory: false },
      { name: 'Business Plan', description: 'Brief description of the proposed business activity', isMandatory: true },
      { name: 'Passport-size Photographs', description: '2 recent photographs', isMandatory: true },
      { name: 'Category Certificate', description: 'SC/ST/OBC certificate if applicable', isMandatory: false },
    ],
    benefits: {
      loanRange: { min: 0, max: 50000 },
      subsidyPercent: 0,
      interestRate: 'As per bank norms (typically 10-12% PA)',
      description: 'Collateral-free micro loan up to ₹50,000 for income-generating activities.'
    },
    processSteps: [
      { stepNumber: 1, title: 'Approach Lender', description: 'Visit any bank, NBFC, or MFI', estimatedDays: 1 },
      { stepNumber: 2, title: 'Submit Application', description: 'Fill MUDRA loan application form with documents', estimatedDays: 1 },
      { stepNumber: 3, title: 'Verification', description: 'Bank verifies documents and business viability', estimatedDays: 7 },
      { stepNumber: 4, title: 'Sanction & Disbursement', description: 'Loan sanctioned and disbursed', estimatedDays: 7 },
    ],
    applicantRights: [
      {
        right: 'No collateral or security can be demanded for this loan.',
        explanation: 'MUDRA loans are backed by the Credit Guarantee Fund for Micro Units (CGFMU). Banks cannot ask for property, gold, or any security deposit.',
        escalationPath: 'Branch Manager → MUDRA helpline (1800-180-1111)'
      },
      {
        right: 'No processing fee can be charged for Shishu loans.',
        explanation: 'MUDRA guidelines mandate zero processing fee for Shishu category loans. If charged, demand a refund.',
        escalationPath: 'Branch Manager → Banking Ombudsman'
      },
    ],
    isActive: true,
  },
  {
    name: 'MUDRA Yojana — Kishore',
    ministry: 'Ministry of Finance',
    description: 'Business loans from ₹50,001 to ₹5 lakh for growing enterprises under Pradhan Mantri MUDRA Yojana.',
    schemeType: 'loan',
    eligibilityCriteria: {
      categories: ['SC', 'ST', 'OBC', 'General', 'Minority'],
      genders: ['Male', 'Female', 'Other'],
      ageRange: { min: 18, max: 65 },
      maxIncome: 0,
      businessStages: ['startup', 'growing'],
      sectors: ['manufacturing', 'services', 'trading'],
      locationTypes: ['rural', 'urban'],
    },
    requiredDocs: [
      { name: 'Aadhaar Card', description: 'Identity verification', isMandatory: true },
      { name: 'PAN Card', description: 'Tax identification', isMandatory: true },
      { name: 'Business Registration', description: 'Udyam/shop license if available', isMandatory: false },
      { name: 'Project Report', description: 'Detailed business plan with cost estimates', isMandatory: true },
      { name: 'Bank Statements', description: 'Last 6 months', isMandatory: true },
      { name: 'Address Proof', description: 'Business and residence', isMandatory: true },
    ],
    benefits: {
      loanRange: { min: 50001, max: 500000 },
      subsidyPercent: 0,
      interestRate: 'As per bank norms',
      description: 'Collateral-free business loan for expanding enterprises.'
    },
    processSteps: [
      { stepNumber: 1, title: 'Approach Lender', description: 'Visit any bank, NBFC, or MFI', estimatedDays: 1 },
      { stepNumber: 2, title: 'Submit Application', description: 'Submit MUDRA form with project report', estimatedDays: 2 },
      { stepNumber: 3, title: 'Credit Appraisal', description: 'Bank assesses business viability and repayment capacity', estimatedDays: 10 },
      { stepNumber: 4, title: 'Sanction', description: 'Loan sanctioned', estimatedDays: 5 },
      { stepNumber: 5, title: 'Disbursement', description: 'Amount credited to account', estimatedDays: 5 },
    ],
    applicantRights: [
      {
        right: 'Collateral-free under CGFMU guarantee.',
        explanation: 'No bank can demand collateral for loans up to ₹5 lakh under MUDRA Kishore. The Credit Guarantee Fund for Micro Units covers the risk.',
        escalationPath: 'Branch Manager → Banking Ombudsman → MUDRA portal'
      },
      {
        right: 'Bank cannot demand a guarantor for this loan.',
        explanation: 'MUDRA guidelines explicitly prohibit requiring third-party guarantors. If asked, escalate immediately.',
        escalationPath: 'Branch Manager → Regional Manager → Banking Ombudsman'
      },
    ],
    isActive: true,
  },
  {
    name: 'MUDRA Yojana — Tarun',
    ministry: 'Ministry of Finance',
    description: 'Business loans from ₹5 lakh to ₹10 lakh for established micro-enterprises under Pradhan Mantri MUDRA Yojana.',
    schemeType: 'loan',
    eligibilityCriteria: {
      categories: ['SC', 'ST', 'OBC', 'General', 'Minority'],
      genders: ['Male', 'Female', 'Other'],
      ageRange: { min: 18, max: 65 },
      maxIncome: 0,
      businessStages: ['growing', 'established'],
      sectors: ['manufacturing', 'services', 'trading'],
      locationTypes: ['rural', 'urban'],
    },
    requiredDocs: [
      { name: 'Aadhaar Card', description: 'Identity verification', isMandatory: true },
      { name: 'PAN Card', description: 'Tax identification', isMandatory: true },
      { name: 'Udyam Registration', description: 'MSME registration certificate', isMandatory: true },
      { name: 'Project Report', description: 'Detailed plan with financials', isMandatory: true },
      { name: 'ITR / Financial Statements', description: 'Last 2 years if available', isMandatory: false },
      { name: 'Bank Statements', description: 'Last 12 months', isMandatory: true },
      { name: 'Address Proof', description: 'Business premises proof', isMandatory: true },
    ],
    benefits: {
      loanRange: { min: 500001, max: 1000000 },
      subsidyPercent: 0,
      interestRate: 'As per bank norms',
      description: 'Collateral-free loan for scaling established micro-enterprises.'
    },
    processSteps: [
      { stepNumber: 1, title: 'Apply Online or Visit Branch', description: 'Apply via Udyamimitra or visit bank', estimatedDays: 1 },
      { stepNumber: 2, title: 'Document Submission', description: 'Submit all required documents', estimatedDays: 3 },
      { stepNumber: 3, title: 'Credit Appraisal', description: 'Detailed credit and business assessment', estimatedDays: 15 },
      { stepNumber: 4, title: 'Sanction', description: 'Loan sanctioned', estimatedDays: 5 },
      { stepNumber: 5, title: 'Disbursement', description: 'Amount disbursed in stages or lump sum', estimatedDays: 7 },
    ],
    applicantRights: [
      {
        right: 'Rejection must be communicated in writing with a clear reason.',
        explanation: 'RBI guidelines require banks to provide a written rejection letter stating specific reasons. Verbal rejections are not acceptable.',
        escalationPath: 'Branch Manager → Lead District Manager → Banking Ombudsman'
      },
      {
        right: 'Collateral-free up to ₹10 lakh under CGFMU.',
        explanation: 'No property, gold, or personal asset can be demanded as collateral.',
        escalationPath: 'Branch Manager → MUDRA helpline'
      },
    ],
    isActive: true,
  },
  {
    name: 'PMEGP — Prime Minister Employment Generation Programme',
    ministry: 'Ministry of MSME',
    description: 'Generates self-employment through establishment of micro-enterprises with government subsidy up to 35% for special categories.',
    schemeType: 'subsidy',
    eligibilityCriteria: {
      categories: ['SC', 'ST', 'OBC', 'General', 'Minority'],
      genders: ['Male', 'Female', 'Other'],
      ageRange: { min: 18, max: 45 },
      maxIncome: 0,
      businessStages: ['idea', 'startup'],
      sectors: ['manufacturing', 'services'],
      locationTypes: ['rural', 'urban'],
      minEducation: '8th_pass',
    },
    requiredDocs: [
      { name: 'Aadhaar Card', description: 'Identity verification', isMandatory: true },
      { name: 'Educational Certificate', description: '8th pass certificate (for projects >₹10L manufacturing / >₹5L service)', isMandatory: true },
      { name: 'Caste Certificate', description: 'For claiming higher subsidy', isMandatory: false },
      { name: 'Project Report', description: 'Detailed cost estimates and viability', isMandatory: true },
      { name: 'EDP Training Certificate', description: 'Entrepreneurship Development Programme', isMandatory: true },
      { name: 'Rural Area Certificate', description: 'For claiming higher subsidy (rural)', isMandatory: false },
    ],
    benefits: {
      loanRange: { min: 0, max: 5000000 },
      subsidyPercent: 35,
      interestRate: 'Normal bank rate (subsidy reduces effective cost)',
      description: 'SC/ST/Women/Minorities get 35% subsidy in rural areas (25% urban). General category: 25% rural, 15% urban. Manufacturing limit: ₹50 lakh, Service: ₹20 lakh.'
    },
    processSteps: [
      { stepNumber: 1, title: 'Online Application', description: 'Apply on PMEGP e-portal (kviconline.gov.in)', estimatedDays: 1 },
      { stepNumber: 2, title: 'KVIC/DIC Review', description: 'Application reviewed by KVIC or District Industries Centre', estimatedDays: 15 },
      { stepNumber: 3, title: 'Interview', description: 'Project assessment interview', estimatedDays: 5 },
      { stepNumber: 4, title: 'Bank Forwarding', description: 'Approved applications forwarded to bank', estimatedDays: 7 },
      { stepNumber: 5, title: 'Bank Sanction', description: 'Bank sanctions the loan component', estimatedDays: 15 },
      { stepNumber: 6, title: 'EDP Training', description: 'Complete mandatory EDP training', estimatedDays: 10 },
      { stepNumber: 7, title: 'Subsidy Release', description: 'Subsidy released to margin money account', estimatedDays: 15 },
    ],
    applicantRights: [
      {
        right: 'SC/ST/Women entrepreneurs are entitled to 35% subsidy in rural areas — this cannot be reduced.',
        explanation: 'The higher subsidy rate for special categories is mandated by PMEGP guidelines. No implementing agency can offer a lower rate.',
        escalationPath: 'DIC → State PMEGP Committee → Ministry of MSME'
      },
      {
        right: 'You cannot be denied based on your caste or community.',
        explanation: 'PMEGP is open to all categories. SC/ST/OBC/Minority applicants receive preferential subsidy rates as affirmative action.',
        escalationPath: 'KVIC → District Collector → Ministry of MSME grievance portal'
      },
      {
        right: 'Age relaxation: SC/ST/OBC/Women/Minorities eligible up to 45 years (vs 35 for general).',
        explanation: 'Special category applicants have extended age eligibility. If rejected on age grounds between 35-45, the rejection is invalid for special categories.',
        escalationPath: 'KVIC/DIC → State Directorate of Industries'
      },
    ],
    isActive: true,
  },
  {
    name: 'PM SVANidhi — Street Vendor AtmaNirbhar Nidhi',
    ministry: 'Ministry of Housing and Urban Affairs',
    description: 'Affordable working capital loans up to ₹50,000 for street vendors to resume livelihoods, with digital payment incentive cashback.',
    schemeType: 'loan',
    eligibilityCriteria: {
      categories: ['SC', 'ST', 'OBC', 'General', 'Minority'],
      genders: ['Male', 'Female', 'Other'],
      ageRange: { min: 18, max: 65 },
      maxIncome: 0,
      businessStages: ['startup', 'growing', 'established'],
      sectors: ['trading', 'services'],
      locationTypes: ['urban'],
      requiresStreetVendor: true,
      requiresVendingCertificate: true,
    },
    requiredDocs: [
      { name: 'Aadhaar Card', description: 'Identity verification', isMandatory: true },
      { name: 'Certificate of Vending / Letter of Recommendation', description: 'Issued by ULB or Town Vending Committee', isMandatory: true },
      { name: 'Passport-size Photographs', description: '2 recent photographs', isMandatory: true },
      { name: 'Bank Account Details', description: 'Savings account for disbursement', isMandatory: true },
    ],
    benefits: {
      loanRange: { min: 10000, max: 50000 },
      subsidyPercent: 0,
      interestRate: 'Subsidized (~7% PA with interest subvention)',
      description: 'Three-tranche loans (₹10K → ₹20K → ₹50K) with 7% interest subvention and up to ₹1,200/year digital payment cashback.'
    },
    processSteps: [
      { stepNumber: 1, title: 'Online Application', description: 'Apply via PM SVANidhi portal or mobile app', estimatedDays: 1 },
      { stepNumber: 2, title: 'ULB Verification', description: 'Urban Local Body verifies vendor status', estimatedDays: 7 },
      { stepNumber: 3, title: 'Bank Processing', description: 'Lender processes the application', estimatedDays: 10 },
      { stepNumber: 4, title: 'Disbursement', description: 'First tranche (₹10,000) disbursed', estimatedDays: 5 },
    ],
    applicantRights: [
      {
        right: 'No middleman or agent is authorized by MUDRA/SVANidhi.',
        explanation: 'If anyone demands a commission or "facilitation fee" for processing your SVANidhi application, they are operating illegally. Report them immediately.',
        escalationPath: 'ULB helpdesk → PM SVANidhi helpline → MoHUA grievance portal'
      },
      {
        right: 'Digital payment incentive cashback is your right, not a favor.',
        explanation: 'If you make at least 50 qualifying digital transactions per month, you are entitled to cashback. Banks cannot withhold this.',
        escalationPath: 'Branch Manager → PM SVANidhi portal complaint'
      },
    ],
    isActive: true,
  },
  {
    name: 'NSFDC Term Loan',
    ministry: 'Ministry of Social Justice and Empowerment',
    description: 'Concessional term loans up to ₹30 lakh through State Channelizing Agencies for income-generating activities by Scheduled Caste entrepreneurs.',
    schemeType: 'loan',
    eligibilityCriteria: {
      categories: ['SC'],
      genders: ['Male', 'Female', 'Other'],
      ageRange: { min: 18, max: 55 },
      maxIncome: 500000,
      businessStages: ['idea', 'startup', 'growing'],
      sectors: ['manufacturing', 'services', 'trading', 'agriculture'],
      locationTypes: ['rural', 'urban'],
    },
    requiredDocs: [
      { name: 'Aadhaar Card', description: 'Identity verification', isMandatory: true },
      { name: 'Caste Certificate (SC)', description: 'Issued by competent authority', isMandatory: true },
      { name: 'Income Certificate', description: 'Annual family income ≤ ₹5 lakh', isMandatory: true },
      { name: 'Project Report', description: 'Business plan with cost estimates', isMandatory: true },
      { name: 'Bank Account Details', description: 'For loan disbursement', isMandatory: true },
      { name: 'Address Proof', description: 'Residence proof', isMandatory: true },
    ],
    benefits: {
      loanRange: { min: 0, max: 3000000 },
      subsidyPercent: 0,
      interestRate: 'Concessional (typically 4-6% PA)',
      description: 'Term loans up to ₹30 lakh at concessional interest rates for SC entrepreneurs through SCAs.'
    },
    processSteps: [
      { stepNumber: 1, title: 'Apply via SCA', description: 'Contact State Channelizing Agency or district office', estimatedDays: 3 },
      { stepNumber: 2, title: 'Document Verification', description: 'SCA verifies eligibility documents', estimatedDays: 15 },
      { stepNumber: 3, title: 'Project Appraisal', description: 'SCA assesses project viability', estimatedDays: 15 },
      { stepNumber: 4, title: 'NSFDC Approval', description: 'SCA forwards to NSFDC for final approval', estimatedDays: 20 },
      { stepNumber: 5, title: 'Disbursement', description: 'Loan disbursed via SCA', estimatedDays: 15 },
    ],
    applicantRights: [
      {
        right: 'Concessional interest rate is your right — bank cannot charge market rate.',
        explanation: 'NSFDC loans are specifically designed at below-market rates (4-6% PA). If the channelizing agency charges a higher rate, it violates NSFDC guidelines.',
        escalationPath: 'SCA → NSFDC Head Office (011-23382044) → MoSJE grievance portal'
      },
      {
        right: 'NSFDC does not authorize agents. Apply directly through SCA.',
        explanation: 'No middlemen, agents, or facilitators are authorized. All applications must go through the official State Channelizing Agency.',
        escalationPath: 'SCA → NSFDC → MoSJE'
      },
    ],
    isActive: true,
  },
  {
    name: 'NBCFDC General Loan Scheme',
    ministry: 'Ministry of Social Justice and Empowerment',
    description: 'Concessional financial assistance for income-generating activities by Other Backward Classes (OBC) members through State Channelizing Agencies.',
    schemeType: 'loan',
    eligibilityCriteria: {
      categories: ['OBC'],
      genders: ['Male', 'Female', 'Other'],
      ageRange: { min: 18, max: 55 },
      maxIncome: 300000,
      businessStages: ['idea', 'startup', 'growing'],
      sectors: ['manufacturing', 'services', 'trading', 'agriculture'],
      locationTypes: ['rural', 'urban'],
    },
    requiredDocs: [
      { name: 'Aadhaar Card', description: 'Identity verification', isMandatory: true },
      { name: 'OBC Certificate', description: 'Backward Classes certificate', isMandatory: true },
      { name: 'Income Certificate', description: 'Annual family income ≤ ₹3 lakh', isMandatory: true },
      { name: 'Business Plan', description: 'Description of proposed activity', isMandatory: true },
      { name: 'Bank Account Details', description: 'For loan disbursement', isMandatory: true },
    ],
    benefits: {
      loanRange: { min: 0, max: 1000000 },
      subsidyPercent: 0,
      interestRate: 'Concessional (varies by loan amount)',
      description: 'Loans for agriculture, small business, transport, and service activities at concessional rates.'
    },
    processSteps: [
      { stepNumber: 1, title: 'Contact SCA', description: 'Apply through State Channelizing Agency', estimatedDays: 3 },
      { stepNumber: 2, title: 'Eligibility Verification', description: 'SCA verifies OBC status and income', estimatedDays: 10 },
      { stepNumber: 3, title: 'Loan Appraisal', description: 'Project viability assessment', estimatedDays: 15 },
      { stepNumber: 4, title: 'NBCFDC Sanction', description: 'Final approval from NBCFDC', estimatedDays: 15 },
      { stepNumber: 5, title: 'Disbursement', description: 'Loan disbursed through SCA', estimatedDays: 10 },
    ],
    applicantRights: [
      {
        right: 'Must be routed through official SCA — no agent fees.',
        explanation: 'NBCFDC operates exclusively through State Channelizing Agencies. Any person demanding a processing fee outside official channels is not authorized.',
        escalationPath: 'SCA → NBCFDC (nbcfdc.gov.in) → MoSJE'
      },
      {
        right: 'You are entitled to the concessional interest rate specified for your loan slab.',
        explanation: 'Rates are fixed by NBCFDC guidelines. The SCA cannot arbitrarily add margins.',
        escalationPath: 'SCA → NBCFDC Head Office → MoSJE'
      },
    ],
    isActive: true,
  },
  {
    name: 'New Swarnima Loan Scheme for Women',
    ministry: 'Ministry of Social Justice and Empowerment — NBCFDC',
    description: 'Exclusive loan scheme for women entrepreneurs from Backward Classes, providing loans up to ₹2 lakh at 5% PA interest.',
    schemeType: 'loan',
    eligibilityCriteria: {
      categories: ['OBC'],
      genders: ['Female'],
      ageRange: { min: 18, max: 55 },
      maxIncome: 300000,
      businessStages: ['idea', 'startup', 'growing'],
      sectors: ['manufacturing', 'services', 'trading', 'agriculture'],
      locationTypes: ['rural', 'urban'],
    },
    requiredDocs: [
      { name: 'Aadhaar Card', description: 'Identity verification', isMandatory: true },
      { name: 'OBC Certificate', description: 'Backward Classes certificate', isMandatory: true },
      { name: 'Income Certificate', description: 'Annual family income ≤ ₹3 lakh', isMandatory: true },
      { name: 'Business Plan', description: 'Brief plan for income-generating activity', isMandatory: true },
      { name: 'Bank Account Details', description: 'In the woman applicant\'s name', isMandatory: true },
    ],
    benefits: {
      loanRange: { min: 0, max: 200000 },
      subsidyPercent: 0,
      interestRate: '5% per annum (fixed)',
      description: 'Women-only loan up to ₹2 lakh at a fixed 5% annual interest rate. One of the most affordable credit schemes available.'
    },
    processSteps: [
      { stepNumber: 1, title: 'Apply via SCA', description: 'Contact NBCFDC State Channelizing Agency', estimatedDays: 3 },
      { stepNumber: 2, title: 'Document Verification', description: 'SCA verifies gender, OBC status, and income', estimatedDays: 10 },
      { stepNumber: 3, title: 'Loan Processing', description: 'Application processed and forwarded to NBCFDC', estimatedDays: 15 },
      { stepNumber: 4, title: 'Sanction & Disbursement', description: 'Loan sanctioned and disbursed', estimatedDays: 15 },
    ],
    applicantRights: [
      {
        right: 'Interest rate capped at 5% PA — this is non-negotiable.',
        explanation: 'The New Swarnima scheme mandates a fixed 5% annual interest rate for women from backward classes. No SCA can charge a higher rate.',
        escalationPath: 'SCA → NBCFDC → MoSJE'
      },
      {
        right: 'This is a women-only scheme — your gender is an asset, not a barrier.',
        explanation: 'Designed exclusively for women entrepreneurs from backward classes. No bank official should suggest you apply to a "general" scheme instead.',
        escalationPath: 'SCA → NBCFDC helpline → MoSJE National Commission for Backward Classes'
      },
      {
        right: 'Bank account must be in your name — joint accounts are not mandatory.',
        explanation: 'You have the right to receive disbursement in your individual bank account. No one can require a joint account with a male family member.',
        escalationPath: 'SCA → Branch Manager → NBCFDC'
      },
    ],
    isActive: true,
  },
  {
    name: 'Venture Capital Fund for Scheduled Castes (VCF-SC)',
    ministry: 'Ministry of Social Justice and Empowerment — NSFDC',
    description: 'Equity and debt support for innovative, growth-oriented businesses owned by Scheduled Caste entrepreneurs.',
    schemeType: 'equity',
    eligibilityCriteria: {
      categories: ['SC'],
      genders: ['Male', 'Female', 'Other'],
      ageRange: { min: 18, max: 55 },
      maxIncome: 0,
      businessStages: ['startup', 'growing', 'established'],
      sectors: ['manufacturing', 'services', 'trading'],
      locationTypes: ['rural', 'urban'],
    },
    requiredDocs: [
      { name: 'Aadhaar Card', description: 'Identity verification', isMandatory: true },
      { name: 'Caste Certificate (SC)', description: 'Issued by competent authority', isMandatory: true },
      { name: 'Business Registration', description: 'Company/LLP/partnership deed', isMandatory: true },
      { name: 'Detailed Business Plan', description: 'With growth projections and financials', isMandatory: true },
      { name: 'Financial Statements', description: 'Audited accounts (for existing businesses)', isMandatory: false },
      { name: 'PAN Card', description: 'Individual and business', isMandatory: true },
    ],
    benefits: {
      loanRange: { min: 500000, max: 15000000 },
      subsidyPercent: 0,
      interestRate: 'Equity — no interest (dividend-based)',
      description: 'Equity investment up to ₹1.5 crore. No repayment obligation on equity portion — returns are shared through dividends.'
    },
    processSteps: [
      { stepNumber: 1, title: 'Application Submission', description: 'Apply through NSFDC with detailed business plan', estimatedDays: 5 },
      { stepNumber: 2, title: 'Screening', description: 'Initial screening by VCF committee', estimatedDays: 15 },
      { stepNumber: 3, title: 'Due Diligence', description: 'Detailed business and financial assessment', estimatedDays: 30 },
      { stepNumber: 4, title: 'Investment Committee', description: 'Final decision by VCF investment committee', estimatedDays: 15 },
      { stepNumber: 5, title: 'Disbursement', description: 'Equity investment made', estimatedDays: 15 },
    ],
    applicantRights: [
      {
        right: 'No repayment obligation on the equity portion.',
        explanation: 'Venture capital fund investments are equity-based. Unlike loans, you do not need to repay the principal. Returns are shared through dividends or exit.',
        escalationPath: 'NSFDC → MoSJE → Parliamentary Committee on Social Justice'
      },
      {
        right: 'At least 51% controlling stake must remain with the SC entrepreneur.',
        explanation: 'The VCF-SC is designed to support SC-owned businesses. The fund takes minority stakes — your controlling interest is protected.',
        escalationPath: 'NSFDC → MoSJE'
      },
    ],
    isActive: true,
  },
];

/* ───────────────────────────────────────────────────────────────
   20 SAMPLE APPLICANT PROFILES
   ─────────────────────────────────────────────────────────────── */

const applicantProfiles = [
  // --- Demo-critical profiles ---
  { name: 'Lakshmi Devi', email: 'lakshmi@demo.com', password: 'demo123', role: 'applicant', category: 'SC', gender: 'Female', age: 32, businessStage: 'startup', sector: 'manufacturing', location: { state: 'Uttar Pradesh', district: 'Lucknow', isRural: true }, annualIncome: 180000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-lakshmi-001').digest('hex'), educationLevel: '10th_pass' },
  { name: 'Ramesh Ahirwar', email: 'ramesh@demo.com', password: 'demo123', role: 'applicant', category: 'SC', gender: 'Male', age: 28, businessStage: 'idea', sector: 'services', location: { state: 'Madhya Pradesh', district: 'Sagar', isRural: true }, annualIncome: 120000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-ramesh-002').digest('hex'), educationLevel: '8th_pass' },
  { name: 'Fatima Begum', email: 'fatima@demo.com', password: 'demo123', role: 'applicant', category: 'Minority', gender: 'Female', age: 35, businessStage: 'growing', sector: 'trading', location: { state: 'West Bengal', district: 'Kolkata', isRural: false }, annualIncome: 250000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-fatima-003').digest('hex'), educationLevel: 'graduate' },

  // --- Regular profiles with diverse backgrounds ---
  { name: 'Suresh Gond', email: 'suresh@demo.com', password: 'demo123', role: 'applicant', category: 'ST', gender: 'Male', age: 24, businessStage: 'idea', sector: 'agriculture', location: { state: 'Jharkhand', district: 'Ranchi', isRural: true }, annualIncome: 80000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-suresh-004').digest('hex'), educationLevel: '10th_pass' },
  { name: 'Meena Kumari', email: 'meena@demo.com', password: 'demo123', role: 'applicant', category: 'OBC', gender: 'Female', age: 40, businessStage: 'growing', sector: 'services', location: { state: 'Rajasthan', district: 'Jaipur', isRural: false }, annualIncome: 280000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-meena-005').digest('hex'), educationLevel: '12th_pass' },
  { name: 'Arjun Paswan', email: 'arjun@demo.com', password: 'demo123', role: 'applicant', category: 'SC', gender: 'Male', age: 22, businessStage: 'idea', sector: 'trading', location: { state: 'Bihar', district: 'Patna', isRural: true }, annualIncome: 100000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-arjun-006').digest('hex'), educationLevel: '10th_pass' },
  { name: 'Priya Sharma', email: 'priya@demo.com', password: 'demo123', role: 'applicant', category: 'General', gender: 'Female', age: 29, businessStage: 'startup', sector: 'manufacturing', location: { state: 'Gujarat', district: 'Ahmedabad', isRural: false }, annualIncome: 450000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-priya-007').digest('hex'), educationLevel: 'graduate' },
  { name: 'Kailash Meena', email: 'kailash@demo.com', password: 'demo123', role: 'applicant', category: 'ST', gender: 'Male', age: 45, businessStage: 'established', sector: 'manufacturing', location: { state: 'Rajasthan', district: 'Udaipur', isRural: true }, annualIncome: 350000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-kailash-008').digest('hex'), educationLevel: '8th_pass' },
  { name: 'Savitri Yadav', email: 'savitri@demo.com', password: 'demo123', role: 'applicant', category: 'OBC', gender: 'Female', age: 38, businessStage: 'startup', sector: 'services', location: { state: 'Uttar Pradesh', district: 'Varanasi', isRural: true }, annualIncome: 200000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-savitri-009').digest('hex'), educationLevel: '10th_pass' },
  { name: 'Mohammad Irfan', email: 'irfan@demo.com', password: 'demo123', role: 'applicant', category: 'Minority', gender: 'Male', age: 33, businessStage: 'growing', sector: 'trading', location: { state: 'Tamil Nadu', district: 'Chennai', isRural: false }, annualIncome: 320000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-irfan-010').digest('hex'), educationLevel: 'graduate' },
  { name: 'Anita Bhil', email: 'anita@demo.com', password: 'demo123', role: 'applicant', category: 'ST', gender: 'Female', age: 27, businessStage: 'idea', sector: 'services', location: { state: 'Madhya Pradesh', district: 'Dhar', isRural: true }, annualIncome: 90000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-anita-011').digest('hex'), educationLevel: '8th_pass' },
  { name: 'Vikram Jatav', email: 'vikram@demo.com', password: 'demo123', role: 'applicant', category: 'SC', gender: 'Male', age: 31, businessStage: 'startup', sector: 'manufacturing', location: { state: 'Haryana', district: 'Faridabad', isRural: false }, annualIncome: 220000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-vikram-012').digest('hex'), educationLevel: '12th_pass' },
  { name: 'Geeta Devi', email: 'geeta@demo.com', password: 'demo123', role: 'applicant', category: 'OBC', gender: 'Female', age: 42, businessStage: 'established', sector: 'trading', location: { state: 'Maharashtra', district: 'Nagpur', isRural: true }, annualIncome: 260000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-geeta-013').digest('hex'), educationLevel: '10th_pass' },

  // --- Street vendor profiles (for PM SVANidhi matching) ---
  { name: 'Raju Kumar', email: 'raju@demo.com', password: 'demo123', role: 'applicant', category: 'SC', gender: 'Male', age: 36, businessStage: 'established', sector: 'trading', location: { state: 'Delhi', district: 'Central Delhi', isRural: false }, annualIncome: 150000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-raju-014').digest('hex'), educationLevel: 'below_8th', isStreetVendor: true, hasVendingCertificate: true },
  { name: 'Sunita Devi', email: 'sunita@demo.com', password: 'demo123', role: 'applicant', category: 'OBC', gender: 'Female', age: 44, businessStage: 'growing', sector: 'trading', location: { state: 'Uttar Pradesh', district: 'Allahabad', isRural: false }, annualIncome: 130000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-sunita-015').digest('hex'), educationLevel: 'below_8th', isStreetVendor: true, hasVendingCertificate: true },

  // --- Duplicate detection test profiles (same Aadhaar hash as existing profiles) ---
  { name: 'Lakshmi D. (Duplicate)', email: 'lakshmi2@demo.com', password: 'demo123', role: 'applicant', category: 'SC', gender: 'Female', age: 32, businessStage: 'startup', sector: 'manufacturing', location: { state: 'Uttar Pradesh', district: 'Lucknow', isRural: true }, annualIncome: 180000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-lakshmi-001').digest('hex'), educationLevel: '10th_pass' },

  // --- More diverse profiles ---
  { name: 'Deepak Chamar', email: 'deepak@demo.com', password: 'demo123', role: 'applicant', category: 'SC', gender: 'Male', age: 26, businessStage: 'idea', sector: 'services', location: { state: 'Punjab', district: 'Ludhiana', isRural: false }, annualIncome: 170000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-deepak-017').digest('hex'), educationLevel: 'graduate' },
  { name: 'Nirmala Bai', email: 'nirmala@demo.com', password: 'demo123', role: 'applicant', category: 'ST', gender: 'Female', age: 34, businessStage: 'startup', sector: 'agriculture', location: { state: 'Odisha', district: 'Koraput', isRural: true }, annualIncome: 75000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-nirmala-018').digest('hex'), educationLevel: '8th_pass' },
  { name: 'Ashok Rajput', email: 'ashok@demo.com', password: 'demo123', role: 'applicant', category: 'General', gender: 'Male', age: 30, businessStage: 'growing', sector: 'manufacturing', location: { state: 'Karnataka', district: 'Bengaluru', isRural: false }, annualIncome: 500000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-ashok-019').digest('hex'), educationLevel: 'postgraduate' },
  { name: 'Kamala Valmiki', email: 'kamala@demo.com', password: 'demo123', role: 'applicant', category: 'SC', gender: 'Female', age: 39, businessStage: 'startup', sector: 'services', location: { state: 'Chhattisgarh', district: 'Raipur', isRural: true }, annualIncome: 160000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-kamala-020').digest('hex'), educationLevel: '10th_pass' },
];

/* ───────────────────────────────────────────────────────────────
   SYSTEM ACCOUNTS (VLE + Admin)
   ─────────────────────────────────────────────────────────────── */

const systemAccounts = [
  { name: 'Demo Applicant', email: 'applicant@demo.com', password: 'demo123', role: 'applicant', category: 'SC', gender: 'Female', age: 30, businessStage: 'startup', sector: 'manufacturing', location: { state: 'Uttar Pradesh', district: 'Lucknow', isRural: true }, annualIncome: 200000, aadhaarHash: crypto.createHash('sha256').update('aadhaar-demo-applicant').digest('hex'), educationLevel: '10th_pass' },
  { name: 'VLE Operator — Rajesh', email: 'vle@demo.com', password: 'demo123', role: 'vle' },
  { name: 'Ministry Admin', email: 'admin@demo.com', password: 'demo123', role: 'admin' },
];

/* ───────────────────────────────────────────────────────────────
   SEED EXECUTION
   ─────────────────────────────────────────────────────────────── */

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Scheme.deleteMany({});
    await Application.deleteMany({});
    await MatchLog.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Insert schemes
    const insertedSchemes = await Scheme.insertMany(schemes);
    console.log(`✅ Inserted ${insertedSchemes.length} schemes`);

    // Insert system accounts
    for (const acc of systemAccounts) {
      await User.create(acc);
    }
    console.log(`✅ Created ${systemAccounts.length} system accounts`);

    // Insert applicant profiles
    for (const profile of applicantProfiles) {
      await User.create(profile);
    }
    console.log(`✅ Created ${applicantProfiles.length} applicant profiles`);

    // --- Pre-seed the demo rejection scenario ---
    const lakshmi = await User.findOne({ email: 'lakshmi@demo.com' });
    const standupIndia = await Scheme.findOne({ name: 'Stand-Up India' });
    const adminUser = await User.findOne({ email: 'admin@demo.com' });

    if (lakshmi && standupIndia && adminUser) {
      const fingerprint = crypto.createHash('sha256').update(`${lakshmi.aadhaarHash}:${standupIndia._id}`).digest('hex');

      const demoApp = await Application.create({
        userId: lakshmi._id,
        schemeId: standupIndia._id,
        status: 'rejected',
        statusHistory: [
          { status: 'draft', timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), changedBy: lakshmi._id, reason: 'Application created' },
          { status: 'submitted', timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), changedBy: lakshmi._id, reason: 'Application submitted for review' },
          { status: 'under_review', timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), changedBy: adminUser._id, reason: 'Under review by bank branch' },
          { status: 'rejected', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), changedBy: adminUser._id, reason: 'Insufficient collateral provided by applicant' },
        ],
        documentChecklist: standupIndia.requiredDocs.map((d, i) => ({
          docName: d.name,
          isUploaded: i < 5,
          uploadedAt: i < 5 ? new Date(Date.now() - 26 * 24 * 60 * 60 * 1000) : null
        })),
        submittedByRole: 'applicant',
        rejectionReason: 'Insufficient collateral provided by applicant',
        rejectionCategory: 'collateral',
        isRejectionValid: false,
        rejectionFlagReason: 'This scheme provides collateral-free loans. Rejection on grounds of "insufficient collateral" or "no security" is not a valid reason. The applicant has the right to escalate this decision.',
        claimFingerprint: fingerprint,
        submittedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      });
      console.log(`🚨 Created demo rejection scenario for Lakshmi Devi (Stand-Up India)`);

      // Add some other applications to populate the dashboard
      const profiles = await User.find({ role: 'applicant', email: { $ne: 'lakshmi@demo.com' } }).limit(8);
      const schemesList = await Scheme.find({});

      for (let i = 0; i < Math.min(profiles.length, 8); i++) {
        const profile = profiles[i];
        const scheme = schemesList[i % schemesList.length];
        const fp = crypto.createHash('sha256').update(`${profile.aadhaarHash}:${scheme._id}`).digest('hex');
        const statuses = ['submitted', 'under_review', 'approved', 'approved', 'rejected', 'submitted', 'under_review', 'approved'];
        const status = statuses[i];

        const app = {
          userId: profile._id,
          schemeId: scheme._id,
          status,
          statusHistory: [
            { status: 'draft', timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), changedBy: profile._id, reason: 'Application created' },
            { status: 'submitted', timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), changedBy: profile._id, reason: 'Submitted' },
          ],
          documentChecklist: scheme.requiredDocs.map(d => ({
            docName: d.name,
            isUploaded: Math.random() > 0.3,
            uploadedAt: Math.random() > 0.3 ? new Date() : null,
          })),
          submittedByRole: i % 3 === 0 ? 'vle' : 'applicant',
          claimFingerprint: fp,
          submittedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        };

        if (status === 'rejected') {
          app.rejectionReason = 'Application documents incomplete';
          app.rejectionCategory = 'documents';
          app.isRejectionValid = true;
          app.statusHistory.push({ status: 'rejected', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), changedBy: adminUser._id, reason: 'Documents incomplete' });
        }
        if (status === 'approved') {
          app.statusHistory.push({ status: 'approved', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), changedBy: adminUser._id, reason: 'All criteria met' });
        }

        await Application.create(app);
      }
      console.log('📊 Created sample applications for dashboard');
    }

    console.log('\n🎉 Seed complete! Demo accounts:');
    console.log('   📧 applicant@demo.com / demo123');
    console.log('   📧 lakshmi@demo.com / demo123 (rejection demo)');
    console.log('   📧 vle@demo.com / demo123');
    console.log('   📧 admin@demo.com / demo123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();

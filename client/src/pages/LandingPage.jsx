import React from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, ShieldAlert, Users, Scale, FileSearch, ArrowRight, Activity, Handshake, AlertTriangle, FileText, Star, Quote } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex-grow bg-white">
      {/* Government Top Banner */}
      <div className="bg-primary-600 text-white text-center py-1.5 text-xs font-medium tracking-wide">
        Government of India Initiative — Ministry of Micro, Small & Medium Enterprises
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-surface-200 pb-12 sm:pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-12 sm:pt-20 pb-8 sm:pb-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-50 border border-accent-200 text-sm font-semibold text-accent-600 mb-4 sm:mb-6 animate-fade-in-up">
              SIH 2026 — Problem Statement #92
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6 sm:mb-8 text-surface-900 animate-fade-in-up animate-delay-100">
              Unified Access for <br />
              <span className="gradient-text leading-tight block mt-2">Marginalized Entrepreneurs</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-surface-500 mb-8 sm:mb-10 max-w-2xl mx-auto animate-fade-in-up animate-delay-200 px-2">
              A transparent, rights-aware platform fixing the gap between government intent and ground-level execution. Replacing 33+ fragmented portals with one verified matching engine.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animate-delay-300">
              <Link to="/login" className="btn-gold py-3 px-8 text-lg flex items-center justify-center gap-2 group">
                Start Demo Flow
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up animate-delay-400">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="glass-card p-4 sm:p-6 text-center">
              <div className="text-3xl sm:text-4xl font-black text-primary-600 mb-2">94.5%</div>
              <div className="text-xs sm:text-sm text-surface-500">Invalid bank records found in CAG audit (2025)</div>
            </div>
            <div className="glass-card p-4 sm:p-6 text-center">
              <div className="text-3xl sm:text-4xl font-black text-danger-500 mb-2">₹10.9 Cr</div>
              <div className="text-xs sm:text-sm text-surface-500">Lost to duplicate & untraceable claims</div>
            </div>
            <div className="glass-card p-4 sm:p-6 text-center">
              <div className="text-3xl sm:text-4xl font-black text-accent-500 mb-2">18.1%</div>
              <div className="text-xs sm:text-sm text-surface-500">Rural digital literacy (NSSO) requiring Assisted Mode</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features / Problems Solved */}
      <section className="py-16 sm:py-24 bg-surface-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-surface-800">Research-Backed Solutions</h2>
            <p className="text-surface-500 max-w-2xl mx-auto text-sm sm:text-base">Every feature maps directly to documented systemic failures in current scheme execution.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard 
              icon={FileSearch} 
              title="Verified Matching Engine" 
              desc="Replaces 33+ fragmented NeGD portals. Profiles are validated before matching, providing plain-language 'why you matched' explanations to bypass middlemen." 
            />
            <FeatureCard 
              icon={ShieldAlert} 
              title="Fraud Prevention Layer" 
              desc="Cryptographic fingerprinting (ID + Scheme hash) blocks duplicate claims instantly. A tamper-evident status log prevents unauthorized changes." 
            />
            <FeatureCard 
              icon={Scale} 
              title="Rights-Awareness Module" 
              desc="Our key differentiator. Displays legal rights (e.g., collateral-free mandates) before applying, empowering applicants against bank bias." 
            />
            <FeatureCard 
              icon={AlertTriangle} 
              title="Mandatory Rejection Audits" 
              desc="Platform requires a stated reason for rejection. Auto-flags invalid reasons (like demanding collateral on a CGTMSE loan) based on scheme rules." 
            />
            <FeatureCard 
              icon={Activity} 
              title="In-Context Grievance" 
              desc="Unlike the disconnected CPGRAMS system, grievances and one-tap escalations are tied directly to the specific application's thread." 
            />
            <FeatureCard 
              icon={Handshake} 
              title="VLE Assisted Mode" 
              desc="Targeting the 82% rural digital literacy gap, allowing Village Level Entrepreneurs to operate on behalf of beneficiaries securely." 
            />
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-16 sm:py-24 bg-white relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-surface-200"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-100 border border-success-100 text-sm font-semibold text-success-500 mb-4">
              <Star className="w-4 h-4" />
              Real Impact
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-surface-800">Meet Entrepreneurs Who Got Approved</h2>
            <p className="text-surface-500 max-w-2xl mx-auto text-sm sm:text-base">These are sample profiles demonstrating how the platform connects marginalized entrepreneurs with the right schemes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SuccessCard
              name="Lakshmi Devi"
              initials="LD"
              category="SC"
              scheme="Stand-Up India"
              district="Lucknow, UP"
              color="bg-primary-600"
              quote="I didn't know collateral-free loans were my right. HEXAGON showed me and I got ₹15 lakh sanctioned for my tailoring unit."
            />
            <SuccessCard
              name="Fatima Begum"
              initials="FB"
              category="Minority"
              scheme="MUDRA Kishore"
              district="Kolkata, WB"
              color="bg-accent-500"
              quote="As a minority woman, banks kept redirecting me. The matching engine found 3 schemes I qualified for. My garment business is now thriving."
            />
            <SuccessCard
              name="Suresh Gond"
              initials="SG"
              category="ST"
              scheme="PMEGP"
              district="Ranchi, JH"
              color="bg-success-500"
              quote="My VLE helped me apply through Assisted Mode. Got 35% subsidy for my bamboo crafts workshop. The whole process was transparent."
            />
            <SuccessCard
              name="Meena Kumari"
              initials="MK"
              category="OBC"
              scheme="New Swarnima"
              district="Jaipur, RJ"
              color="bg-danger-500"
              quote="The platform flagged my rejection as invalid — the bank had demanded collateral on a collateral-free scheme. After escalation, my loan was approved."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Hexagon className="w-6 h-6" />
            <span className="text-lg font-bold tracking-wider">HEXAGON</span>
          </div>
          <p className="text-primary-200 text-sm">Unified Scheme Access, Verification, Rights-Awareness & Grievance Platform</p>
          <p className="text-primary-300 text-xs mt-2">SIH 2026 — Problem Statement #92</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="glass-card p-5 sm:p-6 group hover:shadow-md transition-shadow duration-200">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-surface-800 mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-surface-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function SuccessCard({ name, initials, category, scheme, district, color, quote }) {
  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between group hover:shadow-md transition-shadow duration-200">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-11 h-11 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
            {initials}
          </div>
          <div>
            <p className="font-bold text-surface-800 text-sm">{name}</p>
            <p className="text-xs text-surface-400">{district}</p>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-50 text-primary-600 border border-primary-100">{category}</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-50 text-surface-600 border border-surface-200">{scheme}</span>
        </div>
        <div className="relative">
          <Quote className="w-4 h-4 text-surface-300 absolute -top-1 -left-1 opacity-50" />
          <p className="text-xs text-surface-500 leading-relaxed italic pl-4">{quote}</p>
        </div>
      </div>
    </div>
  );
}

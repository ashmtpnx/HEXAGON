import React from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, ShieldAlert, Users, Scale, FileSearch, ArrowRight, Activity, Handshake, AlertTriangle, FileText } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex-grow">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-surface-800 pb-20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600 rounded-full blur-[128px] opacity-20"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 bg-accent-600 rounded-full blur-[128px] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-20 pb-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800 border border-surface-700 text-sm font-medium text-primary-300 mb-6 animate-fade-in-up">
              <span className="pulse-dot bg-primary-400"></span>
              SIH 2026 Problem Statement #92
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8 animate-fade-in-up animate-delay-100">
              Unified Access for <br />
              <span className="gradient-text leading-tight block mt-2">Marginalized Entrepreneurs</span>
            </h1>
            
            <p className="text-lg md:text-xl text-surface-300 mb-10 max-w-2xl mx-auto animate-fade-in-up animate-delay-200">
              A transparent, rights-aware platform fixing the gap between government intent and ground-level execution. Replacing 33+ fragmented portals with one verified matching engine.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animate-delay-300">
              <Link to="/login" className="btn-primary py-3 px-8 text-lg flex items-center justify-center gap-2 group">
                Start Demo Flow
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up animate-delay-400">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 text-center">
              <div className="text-4xl font-black text-white mb-2">94.5%</div>
              <div className="text-sm text-surface-400">Invalid bank records found in CAG audit (2025)</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-4xl font-black text-danger-400 mb-2">₹10.9 Cr</div>
              <div className="text-sm text-surface-400">Lost to duplicate & untraceable claims</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-4xl font-black text-accent-400 mb-2">18.1%</div>
              <div className="text-sm text-surface-400">Rural digital literacy (NSSO) requiring Assisted Mode</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features / Problems Solved */}
      <section className="py-24 bg-surface-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Research-Backed Solutions</h2>
            <p className="text-surface-400 max-w-2xl mx-auto">Every feature maps directly to documented systemic failures in current scheme execution.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="glass-card p-6 group hover:-translate-y-1 transition-all duration-300">
      <div className="w-12 h-12 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center mb-4 group-hover:bg-primary-900/30 group-hover:border-primary-500/30 transition-colors">
        <Icon className="w-6 h-6 text-primary-400" />
      </div>
      <h3 className="text-lg font-bold text-surface-100 mb-2">{title}</h3>
      <p className="text-sm text-surface-400 leading-relaxed">{desc}</p>
    </div>
  );
}

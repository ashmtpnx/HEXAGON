import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Users, Scale, FileSearch, ArrowRight, Activity, Handshake, AlertTriangle, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── Hero Section with Cleopatra Grid Pattern ─── */}
      <section className="cleo-grid-bg border-b border-slate-200 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white text-xs font-semibold rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Government Intent to Ground-Level Execution</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Unified National Portal for <br className="hidden sm:inline" />
            <span className="text-amber-700">Marginalized Entrepreneurs</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            A transparent, rights-aware platform replacing 33+ fragmented welfare portals with one verified matching engine and guaranteed administrative accountability.
          </p>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap justify-center items-center gap-3">
            <Link to="/login" className="cleo-btn cleo-btn-primary px-6 py-2.5 text-sm">
              <span>Find Eligible Schemes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/assisted" className="cleo-btn cleo-btn-secondary px-6 py-2.5 text-sm">
              <Handshake className="w-4 h-4 text-amber-600" />
              <span>Field Worker Kiosk Mode</span>
            </Link>
          </div>

          {/* Key Stat Pills */}
          <div className="pt-8 border-t border-slate-200 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-xl font-extrabold text-slate-900 font-mono">100%</p>
              <p className="text-xs text-slate-500 font-medium">Rights Guarantee</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-xl font-extrabold text-slate-900 font-mono">33+</p>
              <p className="text-xs text-slate-500 font-medium">Portals Unified</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-xl font-extrabold text-slate-900 font-mono">14 Days</p>
              <p className="text-xs text-slate-500 font-medium">Deemed Approval</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-xl font-extrabold text-slate-900 font-mono">24/7</p>
              <p className="text-xs text-slate-500 font-medium">Grievance Escalation</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Architecture Pillars (Cleopatra Grid Cards) ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Architecture & Capabilities</h2>
          <p className="text-sm text-slate-600 mt-2">Built specifically to solve structural bottlenecks for SC, ST, OBC, and Women entrepreneurs.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="cleo-card cleo-card-hover p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-md bg-slate-900 text-white flex items-center justify-center">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Deterministic Matching Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates eligibility across micro-finance, capital subsidy, and training schemes based on validated demographic and financial credentials.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-slate-900">
              <span>Zero Document Duplication</span>
              <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="cleo-card cleo-card-hover p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-md bg-amber-600 text-white flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Rights & Legal Protection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatically maps statutory entitlements (e.g., MSMED Act, Stand-Up India guidelines) and highlights non-rejection guarantees.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-amber-800">
              <span>Statutory Compliance Enforced</span>
              <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="cleo-card cleo-card-hover p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-md bg-emerald-700 text-white flex items-center justify-center">
                <Handshake className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Assisted Field Kiosk</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Empowers NGO workers and District Officers to complete voice-assisted applications on behalf of rural applicants lacking digital access.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-800">
              <span>Ground-Level Inclusion</span>
              <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Rights Guarantee Banner ─── */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest">
              <ShieldAlert className="w-4 h-4" />
              <span>Administrative Protection Framework</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Know Your Legal Rights As An Applicant</h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Applications submitted through NyaySetu generate a tamper-evident audit trail with binding SLA timelines for district verifiers.
            </p>
          </div>
          <Link to="/login" className="cleo-btn cleo-btn-accent px-6 py-3 text-sm shrink-0">
            Access Portal & Apply
          </Link>
        </div>
      </section>

      {/* ─── Government Official Footer ─── */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-slate-900" />
            <span className="font-semibold text-slate-800">NyaySetu Welfare System</span>
            <span>• Ministry of Social Justice & Empowerment</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-slate-800 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-800 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-800 cursor-pointer">Helpdesk</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

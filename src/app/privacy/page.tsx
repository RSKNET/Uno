import Link from 'next/link';
import { ArrowLeft, Shield, Mail } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - Uno Matrix',
  description: 'Privacy Policy for Uno Matrix card game score tracking application.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#E2E8F0] py-8 px-4 sm:px-8 lg:px-12 relative overflow-x-hidden font-mono crt-screen">
      
      <div className="w-full max-w-[1600px] mx-auto space-y-6 relative z-10">
        
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-red-500 hover:text-red-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          [ RETURN TO HOME ]
        </Link>

        {/* Header Block */}
        <div className="space-y-4 border border-zinc-800 bg-[#0C0C0F] p-6 relative">
          <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
          <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
          <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
          <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-zinc-800 bg-[#121216] flex items-center justify-center text-red-500">
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-black uppercase tracking-wider text-white">
                Privacy Policy // Uno Matrix
              </h1>
              <p className="text-[11px] text-zinc-500 uppercase tracking-widest">
                Effective Date: September 27, 2026
              </p>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-zinc-800" />

        {/* Policy Body in 3-Column Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-zinc-300 text-xs leading-relaxed font-sans">
          
          <section className="space-y-2 border border-zinc-800/80 bg-[#0C0C0F]/80 p-5 md:col-span-2 lg:col-span-3">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              1. Overview
            </h2>
            <p>
              Uno Matrix (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the application&rdquo;) is an online companion tool designed to track player scores, rounds, and match statistics for Uno card games. This Privacy Policy details how our application collects, uses, protects, and discloses user information, including Google user data accessed via Google Sign-In / OAuth.
            </p>
          </section>

          <section className="space-y-3 border border-zinc-800/80 bg-[#0C0C0F]/80 p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                2. Google User Data Accessed
              </h2>
              <p>
                When you choose to sign in to Uno Matrix using Google Sign-In, our application requests access solely to basic user profile information provided by the standard Google OAuth scope:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                <li><strong className="text-zinc-200">Name:</strong> Used to display your player identity and match records.</li>
                <li><strong className="text-zinc-200">Email Address:</strong> Used for account authentication, identification, and communication.</li>
                <li><strong className="text-zinc-200">Profile Picture (Avatar):</strong> Used to render your player avatar in the scoreboard interface.</li>
              </ul>
            </div>
            <p className="text-zinc-400 text-[11px] italic pt-2 border-t border-zinc-800/60">
              Uno Matrix does not request, access, or store any sensitive Google permissions, contacts, Google Drive files, or Gmail data.
            </p>
          </section>

          <section className="space-y-3 border border-zinc-800/80 bg-[#0C0C0F]/80 p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                3. Purpose and Use of Data
              </h2>
              <p>
                We access and use your Google user data strictly to operate and enhance application features:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                <li>Authenticating user sessions and granting authorized access to game rooms and administration features.</li>
                <li>Associating score entries, match histories, and leaderboard statistics with your player identity.</li>
              </ul>
            </div>
            <p className="text-zinc-300 font-medium pt-2 border-t border-zinc-800/60">
              We do not use Google user data for advertising, marketing campaigns, automated user profiling, or machine learning model training.
            </p>
          </section>

          <section className="space-y-3 border border-zinc-800/80 bg-[#0C0C0F]/80 p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                4. Data Sharing, Transfer, and Disclosure
              </h2>
              <p>
                We take privacy seriously and strictly adhere to Google API Services User Data Policy:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                <li><strong className="text-zinc-200">No Sale of Personal Data:</strong> We never sell, rent, or lease your personal information or Google user data to data brokers or third parties.</li>
                <li><strong className="text-zinc-200">Service Providers:</strong> Data is processed and securely stored through our backend cloud infrastructure provider (Supabase) solely to facilitate database storage, session authentication, and data synchronization.</li>
                <li><strong className="text-zinc-200">No Third-Party Sharing:</strong> We do not transfer Google user data to third parties for purposes outside of providing and improving the core functionality of Uno Matrix.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3 border border-zinc-800/80 bg-[#0C0C0F]/80 p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                5. Data Protection and Storage
              </h2>
              <p>
                We implement industry-standard technical measures to safeguard your information:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                <li>All web traffic and authentication tokens are encrypted in transit using Transport Layer Security (TLS/HTTPS).</li>
                <li>Database records are secured with strict access controls, environment-isolated credentials, and Row Level Security (RLS) policies.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3 border border-zinc-800/80 bg-[#0C0C0F]/80 p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                6. Data Retention and Deletion
              </h2>
              <p>
                We retain user profile data and game statistics only as long as your account remains active or as needed to maintain your game logs.
              </p>
              <p>
                Users may request deletion of their account and associated Google user data at any time. Upon receiving a valid request, we will promptly delete all related profile records from our databases.
              </p>
            </div>
          </section>

          <section className="space-y-3 border border-zinc-800/80 bg-[#0C0C0F]/80 p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-500" />
                7. Developer &amp; Support Contact
              </h2>
              <p>
                If you have any questions, feedback, or data deletion requests regarding this Privacy Policy, please contact the developer directly:
              </p>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded font-mono text-xs">
              <p className="text-zinc-400">Application: <span className="text-white">Uno Matrix</span></p>
              <p className="text-zinc-400">Developer Contact: <a href="mailto:riskicahyadi.2nd@gmail.com" className="text-red-400 hover:text-red-300 underline">riskicahyadi.2nd@gmail.com</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}


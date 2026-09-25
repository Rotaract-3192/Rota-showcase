import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Notice | Rotaract District 3192",
  description:
    "How Rotaract District 3192 processes personal data under India's Digital Personal Data Protection Act, 2023.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
      <p className="font-metadata text-[10px] uppercase tracking-widest text-electric-blue font-bold mb-3">
        Digital Personal Data Protection Act, 2023
      </p>
      <h1 className="font-headline text-3xl md:text-4xl font-bold text-white mb-4">
        Privacy Notice
      </h1>
      <p className="text-sm text-slate-400 font-body mb-10 leading-relaxed">
        Last updated: 21 September 2026. This notice explains how Rotaract District 3192
        (&quot;we&quot;, &quot;District&quot;) processes personal data on{" "}
        <span className="text-slate-300">reporting.rotaract3192.org</span> (the &quot;Portal&quot;).
      </p>

      <div className="space-y-8 text-sm text-slate-300 font-body leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-headline text-lg font-bold text-white">1. Data Fiduciary</h2>
          <p>
            Rotaract District 3192, Bengaluru, India. Contact for privacy / grievance:
            {" "}
            <a href="mailto:secretariat@rotaract3192.org" className="text-electric-blue hover:underline">
              secretariat@rotaract3192.org
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-lg font-bold text-white">2. What we collect</h2>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Account &amp; identity: name, email, phone, club, role (President, Secretary, ZRR, district officers).</li>
            <li>Access requests submitted via the login page.</li>
            <li>Activity / project reports, meetings, orientations, installations, DOV logs, bulletins you upload.</li>
            <li>Optional profile fields such as blood group (club administration only).</li>
            <li>Technical logs needed for security and support (sign-in via Clerk).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-lg font-bold text-white">3. Purpose of processing</h2>
          <p>
            We process data to run district reporting, showcase published impact, moderate submissions,
            communicate with club officers, maintain leaderboards, and secure the Portal. We do not sell
            personal data or use it for unrelated advertising.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-lg font-bold text-white">4. Legal basis / consent</h2>
          <p>
            Club officers and district admins use the Portal as part of Rotaract duties (contractual /
            legitimate district administration). Where you submit an access request or optional fields,
            you consent to that processing. You may withdraw consent for optional processing by emailing
            the contact above; core account data may still be needed while you hold an officer role.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-lg font-bold text-white">5. What is public</h2>
          <p>
            Published projects, club names, zones, officer names shown on the public showcase, and
            aggregated impact statistics may appear on the website. Personal email addresses and phone
            numbers of club leaders are <strong className="text-white">not</strong> exposed on the public API.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-lg font-bold text-white">6. Processors &amp; cross-border transfer</h2>
          <p>
            Sign-in is provided by Clerk; database and file storage by Supabase. These providers may process
            data outside India under their security and contractual safeguards. By using the Portal you
            acknowledge this transfer for the purposes above.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-lg font-bold text-white">7. Retention</h2>
          <p>
            Reporting records are kept for the Rotary year and district audit needs. Soft-deleted records
            may be retained for a limited period for integrity. Access-request data is kept until reviewed
            and then cleared or archived as needed.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-lg font-bold text-white">8. Your rights (Data Principal)</h2>
          <p>Under the DPDP Act you may request:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Access to personal data we hold about you</li>
            <li>Correction of inaccurate data</li>
            <li>Erasure where retention is no longer necessary</li>
            <li>Withdrawal of consent for optional processing</li>
            <li>Grievance redressal via the contact above</li>
          </ul>
          <p>
            Email{" "}
            <a href="mailto:secretariat@rotaract3192.org" className="text-electric-blue hover:underline">
              secretariat@rotaract3192.org
            </a>{" "}
            with subject &quot;DPDP Data Request&quot;. We will respond within a reasonable period.
            Signed-in users can also update profile fields in Settings where available.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-lg font-bold text-white">9. Children</h2>
          <p>
            The Portal is intended for Rotaract members (typically 18+) and district officers.
            We do not knowingly create accounts for children under 18 without appropriate consent.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-lg font-bold text-white">10. Security</h2>
          <p>
            Access to club and district data is role-based (Clerk authentication). We apply administrative
            and technical safeguards appropriate to a district reporting system. Please keep your password
            confidential and sign out on shared devices.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-lg font-bold text-white">11. Cookies</h2>
          <p>
            Essential cookies are used for authentication and session security. See the on-site cookie notice.
            Details also appear in our{" "}
            <Link href="/terms" className="text-electric-blue hover:underline">
              Terms of Use
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

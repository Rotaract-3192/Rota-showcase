import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | Rotaract District 3192",
  description: "Terms for using the Rotaract District 3192 reporting portal.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
      <p className="font-metadata text-[10px] uppercase tracking-widest text-electric-blue font-bold mb-3">
        Portal use
      </p>
      <h1 className="font-headline text-3xl md:text-4xl font-bold text-white mb-4">
        Terms of Use
      </h1>
      <p className="text-sm text-slate-400 font-body mb-10 leading-relaxed">
        Last updated: 21 September 2026. By accessing reporting.rotaract3192.org you agree to these terms.
      </p>

      <div className="space-y-8 text-sm text-slate-300 font-body leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-headline text-lg font-bold text-white">1. Purpose</h2>
          <p>
            The Portal is provided by Rotaract District 3192 for club reporting, district administration,
            and public showcase of approved projects. It is not a general social network.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-lg font-bold text-white">2. Accounts</h2>
          <p>
            Access is limited to verified club officers and district roles. You must provide accurate
            information, keep credentials secure, and use only the roles assigned to you. Sharing accounts
            is not allowed.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-lg font-bold text-white">3. Content you submit</h2>
          <p>
            You confirm you have the right to upload reports, photos, and PDFs. Do not upload unlawful,
            defamatory, or irrelevant personal data of third parties. District admins may moderate,
            feature, hide, or remove content.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-lg font-bold text-white">4. Acceptable use</h2>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>No attempts to access another club&apos;s private reports without authorisation</li>
            <li>No scraping of personal contact data or abuse of APIs</li>
            <li>No malware, automated attacks, or credential stuffing</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-lg font-bold text-white">5. Privacy</h2>
          <p>
            Personal data is handled as described in our{" "}
            <Link href="/privacy" className="text-electric-blue hover:underline">
              Privacy Notice
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-lg font-bold text-white">6. Availability</h2>
          <p>
            The Portal is provided as-is for district operations. We may update features or suspend access
            for maintenance or security.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-lg font-bold text-white">7. Contact</h2>
          <p>
            <a href="mailto:secretariat@rotaract3192.org" className="text-electric-blue hover:underline">
              secretariat@rotaract3192.org
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

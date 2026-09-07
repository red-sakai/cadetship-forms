"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [privacyConsent, setPrivacyConsent] = useState<"consent" | "decline" | "">("");

  const handleContinue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (privacyConsent === "consent") {
      router.push("/register");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0c0a1a] via-[#12102a] to-[#0f0d22] px-4 py-6 font-sans text-zinc-100">
      <main className="mx-auto w-full max-w-3xl rounded-2xl border border-indigo-500/20 bg-[#161335]/90 p-6 shadow-lg shadow-indigo-900/40 sm:p-8">
        <h1 className="text-2xl font-semibold text-indigo-100 sm:text-3xl">Membership Registration</h1>
        <p className="mt-2 text-sm text-slate-300">
          Please review and acknowledge the data privacy statement before proceeding.
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleContinue}>
          <fieldset className="space-y-3 rounded-xl border border-indigo-500/20 bg-indigo-950/40 p-4">
            <legend className="px-2 text-sm font-semibold text-slate-200">Data Privacy Statement</legend>
            <p className="text-sm leading-6 text-slate-300">
              By selecting an option below, you confirm your choice regarding the collection and use of your personal information for membership registration and related processing.
            </p>

            <label className="flex items-start gap-3 text-sm">
              <input
                type="radio"
                name="privacyConsent"
                value="consent"
                className="mt-1"
                checked={privacyConsent === "consent"}
                onChange={() => setPrivacyConsent("consent")}
                required
              />
              <span>
                I acknowledge that I understand and consent to the provision of my information.
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm">
              <input
                type="radio"
                name="privacyConsent"
                value="decline"
                className="mt-1"
                checked={privacyConsent === "decline"}
                onChange={() => setPrivacyConsent("decline")}
                required
              />
              <span>I do not wish to provide my information.</span>
            </label>
          </fieldset>

          {privacyConsent === "decline" && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              You selected “I do not wish to provide my information.” Registration cannot continue.
            </p>
          )}

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-md bg-indigo-600 px-5 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Continue to Registration Form
          </button>
        </form>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabasePublicClient } from "@/lib/supabase";
import { savePersonalInfoFromCookies } from "@/lib/save-personal-info";

type TechnologyRole =
  | "Enterprise Networking Cadet"
  | "Cybersecurity Operations Cadet"
  | "Developer Network Cadet";

const TECHNOLOGY_ROLES: readonly TechnologyRole[] = [
  "Enterprise Networking Cadet",
  "Cybersecurity Operations Cadet",
  "Developer Network Cadet",
];

const ROLE_DESCRIPTIONS: Record<TechnologyRole, string> = {
  "Enterprise Networking Cadet":
    "Focuses on developing practical knowledge and skills aligned with the Cisco CCNA curriculum, particularly in network fundamentals, network access, IP connectivity, IP services, security fundamentals, and basic network automation. Cadets gain hands-on experience through network simulations, laboratories, configuration exercises, and technical projects.",
  "Cybersecurity Operations Cadet":
    "Focuses on the security fundamentals and defensive networking concepts covered within the CCNA curriculum, while providing an introduction to security operations. Develops the cadet's ability to identify network security risks, analyze network activity, and apply fundamental security controls in Cisco-based environments.",
  "Developer Network Cadet":
    "Focuses on the network automation and programmability concepts introduced in the CCNA curriculum. Combines networking fundamentals with programming, APIs, and automation to help cadets understand how modern networks can be monitored, configured, and managed programmatically.",
};

const TRACK_BY_ROLE: Record<TechnologyRole, string> = {
  "Enterprise Networking Cadet": "Enterprise Networking",
  "Cybersecurity Operations Cadet": "Cybersecurity Operations",
  "Developer Network Cadet": "Developer Network",
};

const QUESTIONS_BY_TRACK: Record<string, readonly string[]> = {
  "Enterprise Networking": [
    "What interests you about learning how computer networks work, and what do you hope to gain from the Enterprise Networking track?",
    "If you could set up or troubleshoot a network for a school or small office, what would you want to learn first?",
  ],
  "Cybersecurity Operations": [
    "What interests you about cybersecurity and protecting computer systems, and what do you hope to gain from the Cybersecurity Operations track?",
    "If you could learn one skill to keep networks safe from threats, what would it be and why?",
  ],
  "Developer Network": [
    "What interests you about programming and automation, and what do you hope to gain from the Developer Network track?",
    "If you could build a tool that automates a repetitive task, what kind of tool would you want to create?",
  ],
};



export default function TechnologyDepartmentPage() {
  const router = useRouter();
  const supabase = createSupabasePublicClient();
  const [selectedRole, setSelectedRole] = useState<TechnologyRole | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const track = selectedRole ? TRACK_BY_ROLE[selectedRole] : "";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!event.currentTarget.reportValidity()) {
      return;
    }

    setSubmitError(null);

    const getCookie = (key: string) => {
      if (typeof document === "undefined") return "";
      const cookies = new Map(
        document.cookie.split("; ").filter(Boolean).map((c) => {
          const [rawName, ...rawValue] = c.split("=");
          return [decodeURIComponent(rawName), decodeURIComponent(rawValue.join("="))] as const;
        }),
      );
      return cookies.get(`registration_${key}`) ?? "";
    };
    const firstName = getCookie("firstName");
    const lastName = getCookie("lastName");
    const email = getCookie("email");

    if (!firstName || !lastName || !email) {
      setSubmitError("Missing personal information. Please complete the Personal Information page first.");
      return;
    }

    if (!selectedRole) {
      setSubmitError("Please select a role before submitting.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    setIsSubmitting(true);

    // Save personal info from cookies (only saves when department form is submitted)
    const personalInfoResult = await savePersonalInfoFromCookies();
    if (personalInfoResult.error) {
      setIsSubmitting(false);
      setSubmitError(personalInfoResult.error);
      return;
    }

    const { error } = await supabase.from("registration_technology_cadet").insert({
      first_name: firstName,
      last_name: lastName,
      email,
      track,
      question_1: String(formData.get("technologyQuestion1") ?? ""),
      question_2: String(formData.get("technologyQuestion2") ?? ""),
    });

    if (error) {
      setIsSubmitting(false);
      setSubmitError(error.message);
      return;
    }

    setIsSubmitting(false);

    router.push(`/register/technology-department/submit?role=${encodeURIComponent(selectedRole)}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0c0a1a] via-[#12102a] to-[#0f0d22] px-4 py-6 font-sans text-zinc-100">
      <main className="mx-auto w-full max-w-3xl rounded-2xl border border-indigo-500/20 bg-[#161335]/90 p-6 shadow-lg shadow-indigo-900/40 sm:p-8">
        <h1 className="text-2xl font-semibold text-indigo-100 sm:text-3xl">Registration - Technology Department</h1>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          The Technology Department is responsible for driving technical excellence and innovation within CNCP.
          It consists of three areas: Enterprise Networking, Cybersecurity Operations, and Developer Network. The department focuses on
          providing mentorship, managing projects, and organizing hands-on learning experiences.
        </p>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          For detailed information on each cadetship track, you can refer to{" "}
          <a
            className="font-medium text-indigo-300 underline"
            href="https://docs.google.com/document/d/1dU6wpyFiGRfjeYCiymvxjvigK2m3VN2BdRBaZOwL8ww/edit?tab=t.0#heading=h.vixkji6185jn"
            target="_blank"
            rel="noopener noreferrer"
          >
            this primer
          </a>.
        </p>

        <form className="mt-6 space-y-4 text-sm" onSubmit={handleSubmit}>
          <fieldset className="space-y-3 rounded-xl border border-indigo-500/20 bg-indigo-950/40 p-4 sm:col-span-2">
            <legend className="px-2 text-sm font-semibold">
              What cadetship track would you like to apply for? <span className="text-rose-400">*</span>
            </legend>

            {TECHNOLOGY_ROLES.map((role) => (
              <label key={role} className="flex items-start gap-3 text-sm">
                <input
                  type="radio"
                  name="technologyRole"
                  value={role}
                  className="mt-1"
                  checked={selectedRole === role}
                  onChange={() => setSelectedRole(role)}
                  required
                />
                <span>{role}</span>
              </label>
            ))}
          </fieldset>

          {selectedRole && (
            <section className="space-y-3 rounded-md border border-indigo-500/15 bg-indigo-950/30 p-4 text-sm leading-6 text-slate-300">
              <h2 className="text-base font-semibold text-indigo-100">{selectedRole}</h2>
              <p>{ROLE_DESCRIPTIONS[selectedRole]}</p>
            </section>
          )}

          {selectedRole && (
            <section className="space-y-4 rounded-xl border border-indigo-500/15 bg-slate-800/80 p-4 sm:col-span-2">
              <p className="text-sm font-medium text-indigo-100">
                These questions are intended to give us a general sense of your interest and experience. For
                applicants who qualify, a follow-up interview will be scheduled to get to know you even better.
              </p>

              {QUESTIONS_BY_TRACK[track].map((question, index) => (
                <label key={index} className="block space-y-2 text-sm">
                  <span className="font-medium">
                    {question} <span className="text-rose-400">*</span>
                  </span>
                  <textarea
                    name={`technologyQuestion${index + 1}`}
                    className="min-h-24 w-full rounded-md border border-slate-600/50 bg-slate-800/80 px-3 py-2 outline-none focus:border-indigo-400"
                    required
                  />
                </label>
              ))}
            </section>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-600/50 bg-slate-800/80 px-5 text-sm font-medium text-slate-300 transition hover:bg-indigo-950/30"
              onClick={() => router.push("/register")}
            >
              Previous
            </button>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-md bg-indigo-600 px-5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Submit"}
            </button>
          </div>

          {submitError && (
            <p className="rounded-md border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              {submitError}
            </p>
          )}
        </form>
      </main>
    </div>
  );
}

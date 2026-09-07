"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabasePublicClient } from "@/lib/supabase";
import { savePersonalInfoFromCookies } from "@/lib/save-personal-info";

const MARKETING_OFFICER_ROLES = [
  "Chief Marketing Officer",
  "Vice Chief Marketing Officer",
  "Caption Writer and Engagement Analyst",
  "Content Strategist and Video Director",
] as const;

type MarketingRole = (typeof MARKETING_OFFICER_ROLES)[number];

const ROLE_DESCRIPTIONS: Record<MarketingRole, string> = {
  "Chief Marketing Officer":
    "Develops and implements comprehensive marketing strategies that drive CISCO NetConnect's visibility and engagement among the student body. Focuses on fostering relationships with community members and other organizations to enhance outreach efforts. Collaborates with the Chief Creative Officer on content creation, ensuring that marketing materials resonate with students and reflect the organization's mission.",
  "Vice Chief Marketing Officer":
    "Assists the CMO in executing marketing strategies, playing a critical support role in outreach efforts. Involves conducting market analysis to inform and improve marketing initiatives, ensuring that campaigns are effective and aligned with student interests. Coordinates activities among content planning and creation to maintain consistency in messaging.",
  "Caption Writer and Engagement Analyst":
    "Crafts concise and engaging captions tailored for social media platforms. Creates content that reflects the brand's voice, sparks interest, follows certain trends, and encourages interaction from followers. Tracks and analyzes engagement metrics to evaluate content performance. Provides insights into what's working, guides adjustments to content strategy, and optimizes future campaigns to maximize impact.",
  "Content Strategist and Video Director":
    "Responsible for brainstorming and developing ideas, as well as researching effective messaging, such as titles, taglines, and key concepts, to boost engagement. Involves making an attention-grabbing and on-brand language for each campaign, post, or pubmat.",
};

const MARKETING_QUESTIONS_BY_ROLE: Record<MarketingRole, readonly string[]> = {
  "Chief Marketing Officer": [
    "What does leading a marketing team look like to you, and how would you set the direction for CNCP's brand?",
    "Tell us about a time you led or took charge of a project or activity from start to finish.",
  ],
  "Vice Chief Marketing Officer": [
    "How would you help the Chief Marketing Officer plan and pace the team's content and campaigns?",
    "If two team members had different ideas for a campaign, how would you help them move forward?",
  ],
  "Caption Writer and Engagement Analyst": [
    "How would you approach creating captions that reflect CNCP's brand voice while encouraging engagement from followers?",
    "What strategies would you use to analyze engagement metrics and use them to improve future content?",
  ],
  "Content Strategist and Video Director": [
    "How would you approach brainstorming and developing ideas for a new CNCP campaign or post?",
    "How would you ensure that messaging such as titles, taglines, and key concepts are attention-grabbing and on-brand?",
  ],
};



export default function MarketingDepartmentPage() {
  const router = useRouter();
  const supabase = createSupabasePublicClient();
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    const fullName = `${firstName} ${lastName}`.trim();

    if (!firstName || !lastName || !email) {
      setSubmitError("Missing personal information. Please complete the Personal Information page first.");
      return;
    }

    if (!selectedRole) {
      setSubmitError("Please select a role before submitting.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const questionAnswers = {
      question_1: String(formData.get("marketingQuestion1") ?? ""),
      question_2: String(formData.get("marketingQuestion2") ?? ""),
    };

    // Save personal info from cookies (only saves when department form is submitted)
    const personalInfoResult = await savePersonalInfoFromCookies();
    if (personalInfoResult.error) {
      setIsSubmitting(false);
      setSubmitError(personalInfoResult.error);
      return;
    }

    const { error } = await supabase.from("registration_marketing_department").insert({
      first_name: firstName,
      last_name: lastName,
      email,
      team: "",
      application_role: selectedRole,
      question_answers: questionAnswers,
    });

    if (error) {
      setIsSubmitting(false);
      setSubmitError(error.message);
      return;
    }

    const { error: interviewError } = await supabase.from("to_be_interviewed").insert({
      name: fullName,
      email,
      department: "Marketing",
      team: "",
      role: selectedRole,
      status: "pending",
    });

    if (interviewError) {
      setIsSubmitting(false);
      setSubmitError(interviewError.message);
      return;
    }

    setIsSubmitting(false);

    router.push(`/register/marketing-department/submit?role=${encodeURIComponent(selectedRole)}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0c0a1a] via-[#12102a] to-[#0f0d22] px-4 py-6 font-sans text-zinc-100">
      <main className="mx-auto w-full max-w-3xl rounded-2xl border border-indigo-500/20 bg-[#161335]/90 p-6 shadow-lg shadow-indigo-900/40 sm:p-8">
        <h1 className="text-2xl font-semibold text-indigo-100 sm:text-3xl">Registration - Marketing Department</h1>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          The Marketing Department is responsible for strategizing and executing initiatives that drive brand
          awareness, customer engagement, and market growth. They ensure that CNCP&apos;s brand message is
          consistent, engaging, and effectively targeted to our audiences.
        </p>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          For detailed information on each department role, you can refer to{" "}
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
              What position would you like to apply for? <span className="text-rose-400">*</span>
            </legend>

            {MARKETING_OFFICER_ROLES.map((role) => (
              <label key={role} className="flex items-start gap-3 text-sm">
                <input
                  type="radio"
                  name="marketingRole"
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
              <p>{ROLE_DESCRIPTIONS[selectedRole as MarketingRole]}</p>
            </section>
          )}

          {selectedRole && (
            <section className="space-y-4 rounded-xl border border-indigo-500/15 bg-slate-800/80 p-4 sm:col-span-2">
              <p className="text-sm font-medium text-indigo-100">
                These questions are intended to give us a general sense of your interest and experience. For
                applicants who qualify, a follow-up interview will be scheduled to get to know you even better.
              </p>

              {MARKETING_QUESTIONS_BY_ROLE[selectedRole as MarketingRole].map(
                (question, index) => (
                  <label key={index} className="block space-y-2 text-sm">
                    <span className="font-medium">
                      {question} <span className="text-rose-400">*</span>
                    </span>
                    <textarea
                      name={`marketingQuestion${index + 1}`}
                      className="min-h-24 w-full rounded-md border border-slate-600/50 bg-slate-800/80 px-3 py-2 outline-none focus:border-indigo-400"
                      required
                    />
                  </label>
                ),
              )}
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

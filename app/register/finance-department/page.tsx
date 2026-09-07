"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabasePublicClient } from "@/lib/supabase";
import { savePersonalInfoFromCookies } from "@/lib/save-personal-info";

const FINANCE_OFFICER_ROLES = [
  "Chief Finance Officer",
  "Vice Chief Finance Officer",
  "Auditor",
] as const;

type FinanceRole = (typeof FINANCE_OFFICER_ROLES)[number];

const ROLE_DESCRIPTIONS: Record<FinanceRole, string> = {
  "Chief Finance Officer":
    "Serves as the head of the Finance Department and is responsible for overseeing the organization's overall financial management. Leads financial planning, budgeting, resource allocation, and reporting while ensuring that organizational funds are handled responsibly and transparently.",
  "Vice Chief Finance Officer":
    "Serves as the principal deputy to the Chief Finance Officer and assists in managing the day-to-day operations of the Finance Department. Supports financial planning, transaction management, documentation, and departmental coordination while serving as the acting head of the department when necessary.",
  Auditor:
    "Responsible for independently reviewing the organization's financial records, transactions, and processes to ensure accuracy, transparency, and compliance with established financial policies. Provides an independent layer of accountability and reports identified discrepancies or financial concerns to the appropriate executive leadership.",
};

const FINANCE_QUESTIONS_BY_ROLE: Record<FinanceRole, readonly string[]> = {
  "Chief Finance Officer": [
    "How would you lead the Finance Department in managing CNCP's financial resources responsibly and transparently?",
    "Describe a time you managed a budget, allocated resources, or handled financial planning. What did you learn from the experience?",
  ],
  "Vice Chief Finance Officer": [
    "How would you support the Chief Finance Officer in managing day-to-day financial operations and departmental coordination?",
    "How would you handle a situation where financial documentation needs to be completed under a tight deadline?",
  ],
  Auditor: [
    "How would you approach independently reviewing financial records to ensure accuracy and compliance with policies?",
    "Describe a time you identified an error or discrepancy in a process. How did you handle it and what was the outcome?",
  ],
};



export default function FinanceDepartmentPage() {
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
      leadershipQuestion_1: String(formData.get("financeQuestion1") ?? ""),
      leadershipQuestion_2: String(formData.get("financeQuestion2") ?? ""),
    };

    // Save personal info from cookies (only saves when department form is submitted)
    const personalInfoResult = await savePersonalInfoFromCookies();
    if (personalInfoResult.error) {
      setIsSubmitting(false);
      setSubmitError(personalInfoResult.error);
      return;
    }

    const { error } = await supabase.from("registration_finance_department").insert({
      first_name: firstName,
      last_name: lastName,
      email,
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
      department: "Finance",
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

    router.push(`/register/finance-department/submit?role=${encodeURIComponent(selectedRole)}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0c0a1a] via-[#12102a] to-[#0f0d22] px-4 py-6 font-sans text-zinc-100">
      <main className="mx-auto w-full max-w-3xl rounded-2xl border border-indigo-500/20 bg-[#161335]/90 p-6 shadow-lg shadow-indigo-900/40 sm:p-8">
        <h1 className="text-2xl font-semibold text-indigo-100 sm:text-3xl">Registration - Finance Department</h1>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          The Finance Department is responsible for managing the organization&apos;s financial resources and ensuring that funds are properly planned, documented, allocated, and accounted for. The department works closely with other departments to support events, projects, and organizational initiatives while maintaining transparency and financial accountability.
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

            {FINANCE_OFFICER_ROLES.map((role) => (
              <label key={role} className="flex items-start gap-3 text-sm">
                <input
                  type="radio"
                  name="financeRole"
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
              <p>{ROLE_DESCRIPTIONS[selectedRole as FinanceRole]}</p>
            </section>
          )}

          {selectedRole && (
            <section className="space-y-4 rounded-xl border border-indigo-500/15 bg-slate-800/80 p-4 sm:col-span-2">
              <p className="text-sm font-medium text-indigo-100">
                These questions are intended to give us a general sense of your interest and experience. For
                applicants who qualify, a follow-up interview will be scheduled to get to know you even better.
              </p>

              {FINANCE_QUESTIONS_BY_ROLE[selectedRole as FinanceRole].map(
                (question, index) => (
                  <label key={index} className="block space-y-2 text-sm">
                    <span className="font-medium">
                      {question} <span className="text-rose-400">*</span>
                    </span>
                    <textarea
                      name={`financeQuestion${index + 1}`}
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

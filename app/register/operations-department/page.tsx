"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabasePublicClient } from "@/lib/supabase";
import { savePersonalInfoFromCookies } from "@/lib/save-personal-info";

const OPERATIONS_OFFICER_ROLES = [
  "Program Managers",
  "Hosts",
  "Technical Coordinators",
  "Logistics and Resource Coordinator",
  "Registration and Access Coordinators",
  "Media Documentation Officers",
] as const;

type OperationsRole = (typeof OPERATIONS_OFFICER_ROLES)[number];

const ROLE_DESCRIPTIONS: Record<OperationsRole, string> = {
  "Program Managers":
    "Plan, coordinate, and oversee specific programs or events within the organization. Develop program objectives, manage timelines, and ensure the successful execution of their assigned tasks.",
  Hosts:
    "Host the event, managing the flow and engaging with attendees. Responsible for presenting content, facilitating discussions, and ensuring the event runs smoothly.",
  "Technical Coordinators":
    "Oversee technical aspects of events, including AV equipment, live streaming, and other technical requirements. Ensure all technical systems are functioning correctly and troubleshoot any issues that arise.",
  "Logistics and Resource Coordinator":
    "Responsible for managing the logistical aspects of events, ensuring the smooth setup, transportation, and handling of equipment. Oversee the coordination of resources, manage the flow of materials, and ensure that all necessary items are available and in place for the event.",
  "Registration and Access Coordinators":
    "Handle event registration processes, including managing guest lists and ensuring proper access control. Oversee check-in procedures and assist with any registration-related issues.",
  "Media Documentation Officers":
    "Capture visual documentation of events, including photos of key moments, attendees, and activities. Ensure high-quality images are taken and appropriately archived for future use.",
};

const OPERATIONS_QUESTIONS_BY_ROLE: Record<OperationsRole, readonly string[]> = {
  "Program Managers": [
    "How would you approach planning and coordinating a CNCP event from start to finish?",
    "Describe a time you managed timelines or coordinated multiple tasks for a project. How did you ensure everything stayed on track?",
  ],
  Hosts: [
    "How would you engage with attendees and manage the flow of an event you're hosting?",
    "Describe a time you presented or facilitated a discussion. How did you keep the audience engaged?",
  ],
  "Technical Coordinators": [
    "How would you ensure that all technical systems (AV, streaming, etc.) are functioning correctly before and during an event?",
    "Describe a time you troubleshooted a technical issue during an event. How did you handle it?",
  ],
  "Logistics and Resource Coordinator": [
    "How would you approach managing the setup and transportation of equipment for an event?",
    "How would you ensure that all necessary items are available and in place before an event starts?",
  ],
  "Registration and Access Coordinators": [
    "How would you manage event registration processes and ensure proper access control?",
    "Describe a time you handled a registration issue or managed a guest list. How did you resolve any problems?",
  ],
  "Media Documentation Officers": [
    "How would you approach capturing high-quality photos and visual documentation during an event?",
    "How would you ensure that event photos are properly archived and organized for future use?",
  ],
};



export default function OperationsDepartmentPage() {
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
      question_1: String(formData.get("operationsQuestion1") ?? ""),
      question_2: String(formData.get("operationsQuestion2") ?? ""),
    };

    // Save personal info from cookies (only saves when department form is submitted)
    const personalInfoResult = await savePersonalInfoFromCookies();
    if (personalInfoResult.error) {
      setIsSubmitting(false);
      setSubmitError(personalInfoResult.error);
      return;
    }

    const { error } = await supabase.from("registration_operations_department").insert({
      first_name: firstName,
      last_name: lastName,
      email,
      committee: "",
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
      department: "Operations",
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

    router.push(`/register/operations-department/submit?role=${encodeURIComponent(selectedRole)}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0c0a1a] via-[#12102a] to-[#0f0d22] px-4 py-6 font-sans text-zinc-100">
      <main className="mx-auto w-full max-w-3xl rounded-2xl border border-indigo-500/20 bg-[#161335]/90 p-6 shadow-lg shadow-indigo-900/40 sm:p-8">
        <h1 className="text-2xl font-semibold text-indigo-100 sm:text-3xl">Registration - Operations Department</h1>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          The Operations Department is the backbone of organizational logistics and event execution. We oversee
          every step of the operational process, ensuring smooth planning and implementation of events conducted
          within the organization. This team ensures CNCP&apos;s events run efficiently, delivering a seamless,
          professional, and engaging experience for attendees and team members.
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

            {OPERATIONS_OFFICER_ROLES.map((role) => (
              <label key={role} className="flex items-start gap-3 text-sm">
                <input
                  type="radio"
                  name="operationsRole"
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
              <p>{ROLE_DESCRIPTIONS[selectedRole as OperationsRole]}</p>
            </section>
          )}

          {selectedRole && (
            <section className="space-y-4 rounded-xl border border-indigo-500/15 bg-slate-800/80 p-4 sm:col-span-2">
              <p className="text-sm font-medium text-indigo-100">
                These questions are intended to give us a general sense of your interest and experience. For
                applicants who qualify, a follow-up interview will be scheduled to get to know you even better.
              </p>

              {OPERATIONS_QUESTIONS_BY_ROLE[selectedRole as OperationsRole].map(
                (question, index) => (
                  <label key={index} className="block space-y-2 text-sm">
                    <span className="font-medium">
                      {question} <span className="text-rose-400">*</span>
                    </span>
                    <textarea
                      name={`operationsQuestion${index + 1}`}
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

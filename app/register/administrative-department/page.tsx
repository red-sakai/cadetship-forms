"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabasePublicClient } from "@/lib/supabase";
import { savePersonalInfoFromCookies } from "@/lib/save-personal-info";

const ADMINISTRATIVE_OFFICER_ROLES = [
  "Secretariat Officers",
  "Membership Officers",
  "Institutional Affairs Officers",
  "Internal Operations Officers",
  "Administrative Systems Officers",
  "Events & Records Officers",
] as const;

type AdministrativeRole = (typeof ADMINISTRATIVE_OFFICER_ROLES)[number];

const ROLE_DESCRIPTIONS: Record<AdministrativeRole, string> = {
  "Secretariat Officers":
    "Manages official documentation, meetings, correspondence, and organizational records. Prepares agendas and materials for meetings, records and prepares minutes of meetings, maintains official meeting records, documents important organizational decisions and directives, prepares administrative reports and documentation, maintains official administrative templates, ensures important documents are properly filed and accessible, assists in preparing official letters, memoranda, and correspondence, maintains historical and institutional documentation, and organizes and maintains CNCP's documentation archive.",
  "Membership Officers":
    "Manages membership information and member-related administration. Manages membership records and databases, processes membership applications and related documentation, maintains the official list of members and officers per department, maintains onboarding and offboarding records, ensures member information is complete and up to date, coordinates administrative requirements for incoming members, maintains records of member status and organizational affiliation, handles administrative concerns related to membership, coordinates with departments when member information is required, prepares membership-related reports when needed, and ensures membership records are properly secured and organized.",
  "Institutional Affairs Officers":
    "Manages CNCP's formal administrative relationship and requirements with the school/institution. Coordinates with the preparation of the General Plan of Activities (GPOA), manages the GPOA submission process, monitors GPOA deadlines and requirements, maintains records of GPOA submissions, revisions, approvals, and related correspondence, coordinates with relevant PUP offices regarding organizational requirements, facilitates physical submission and retrieval of documents when necessary, follows up on pending institutional submissions and requests, maintains records of official transmittals and received documents, communicates institutional requirements to the CAO, VCAO, and concerned departments, monitors other school-required organizational documents and deadlines, and ensures CNCP responds to institutional requirements within prescribed timelines.",
  "Internal Operations Officers":
    "Ensures internal administrative tasks, deadlines, and coordination are properly followed through. Maintains and manages the organization's administrative task tracker, monitors deadlines and pending administrative requirements, follows up with departments and officers regarding outstanding tasks, coordinates administrative requirements between departments, monitors completion of assigned administrative deliverables, identifies delayed, incomplete, or unresolved administrative tasks, escalates significant delays to the VCAO, establishes standardized internal administrative workflows, coordinates recurring administrative processes, maintains visibility over ongoing administrative work, and assists the VCAO in monitoring overall operational progress.",
  "Administrative Systems Officers":
    "Manages the administrative use, requirements, and workflows of CNCP's systems. Oversee the administrative use of CNCP's systems, including Batchmail and SSO Handling, Admin Dashboard, and Tracker. Defines administrative requirements for systems, ensures administrative teams use systems consistently, coordinates with the other administrative teams regarding the proper safekeeping and organization of CNCP's official documents in the system, identifies gaps and inefficiencies in administrative workflows, coordinates system requirements with the Technology Department, maintains administrative data workflows, documents procedures for administrative systems, monitors whether systems are effectively supporting administrative operations, recommends improvements to systems and workflows, and coordinates testing and administrative validation of new system features when necessary.",
  "Events & Records Officers":
    "Handles the administrative and logistical execution of CNCP events. Coordinates the administrative requirements of CNCP events with the Operations Department, maintains event-related administrative documentation, coordinates attendance tracking with the Operations Department, consolidates event statistics and participation data, tracks records of event participation and outputs, coordinates and records event statistics for post-event reports, monitors completion of event administrative requirements, coordinates with event/program teams regarding administrative requirements, and ensures event-related administrative processes are completed within deadlines.",
};

const ADMINISTRATIVE_QUESTIONS_BY_ROLE: Record<AdministrativeRole, readonly string[]> = {
  "Secretariat Officers": [
    "How would you manage official documentation and ensure that organizational records are accurate and accessible?",
    "Describe a time you managed documents, schedules, or records. How did you stay organized and ensure nothing was missed?",
  ],
  "Membership Officers": [
    "How would you manage membership records and ensure that member information is complete and up to date?",
    "Describe a time you handled member-related administration or processed applications. How did you ensure accuracy and efficiency?",
  ],
  "Institutional Affairs Officers": [
    "How would you coordinate with the school regarding organizational requirements such as the GPOA?",
    "Describe a time you followed up on pending submissions or coordinated with institutional offices. How did you ensure timely completion?",
  ],
  "Internal Operations Officers": [
    "How would you monitor administrative tasks and ensure that deadlines are met across departments?",
    "Describe a time you identified delayed or incomplete tasks and escalated them appropriately. How did you handle it?",
  ],
  "Administrative Systems Officers": [
    "How would you manage the administrative use of CNCP's systems and ensure they support operational needs?",
    "Describe a time you identified gaps or inefficiencies in a system or workflow. How did you address them?",
  ],
  "Events & Records Officers": [
    "How would you coordinate the administrative requirements for a CNCP event with the Operations Department?",
    "Describe a time you tracked event statistics or participation data. How did you ensure accuracy and completeness?",
  ],
};



export default function AdministrativeDepartmentPage() {
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
      question_1: String(formData.get("administrativeQuestion1") ?? ""),
      question_2: String(formData.get("administrativeQuestion2") ?? ""),
    };

    // Save personal info from cookies (only saves when department form is submitted)
    const personalInfoResult = await savePersonalInfoFromCookies();
    if (personalInfoResult.error) {
      setIsSubmitting(false);
      setSubmitError(personalInfoResult.error);
      return;
    }

    const { error } = await supabase.from("registration_administrative_department").insert({
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
      department: "Administrative",
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

    router.push(`/register/administrative-department/submit?role=${encodeURIComponent(selectedRole)}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0c0a1a] via-[#12102a] to-[#0f0d22] px-4 py-6 font-sans text-zinc-100">
      <main className="mx-auto w-full max-w-3xl rounded-2xl border border-indigo-500/20 bg-[#161335]/90 p-6 shadow-lg shadow-indigo-900/40 sm:p-8">
        <h1 className="text-2xl font-semibold text-indigo-100 sm:text-3xl">Registration - Administrative Department</h1>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          The Administrative Department manages CNCP&apos;s official papers, records, and governance workflows.
          This department ensures that documents are accurate, timely, and aligned with organizational and
          institutional requirements. Through structured documentation, compliance checks, and formal coordination
          with partners and offices, the team helps maintain operational continuity, accountability, and trust.
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

            {ADMINISTRATIVE_OFFICER_ROLES.map((role) => (
              <label key={role} className="flex items-start gap-3 text-sm">
                <input
                  type="radio"
                  name="administrativeRole"
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
              <p>{ROLE_DESCRIPTIONS[selectedRole as AdministrativeRole]}</p>
            </section>
          )}

          {selectedRole && (
            <section className="space-y-4 rounded-xl border border-indigo-500/15 bg-slate-800/80 p-4 sm:col-span-2">
              <p className="text-sm font-medium text-indigo-100">
                These questions are intended to give us a general sense of your interest and experience. For
                applicants who qualify, a follow-up interview will be scheduled to get to know you even better.
              </p>

              {ADMINISTRATIVE_QUESTIONS_BY_ROLE[selectedRole as AdministrativeRole].map(
                (question, index) => (
                  <label key={index} className="block space-y-2 text-sm">
                    <span className="font-medium">
                      {question} <span className="text-rose-400">*</span>
                    </span>
                    <textarea
                      name={`administrativeQuestion${index + 1}`}
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabasePublicClient } from "@/lib/supabase";

const COOKIE_PREFIX = "registration_";

type TechnologyRole =
  | "Enterprise Networking Cadet"
  | "CyberOps Cadet"
  | "DevNet Cadet";

const TECHNOLOGY_ROLES: readonly TechnologyRole[] = [
  "Enterprise Networking Cadet",
  "CyberOps Cadet",
  "DevNet Cadet",
];

const ROLE_DESCRIPTIONS: Record<TechnologyRole, string> = {
  "Enterprise Networking Cadet":
    "Learns network fundamentals, design, configuration, security, and troubleshooting through a curriculum aligned with the Cisco Certified Network Associate (CCNA), hands-on laboratories, and projects that develop practical skills in managing reliable enterprise networks.",
  "CyberOps Cadet":
    "Learns threat monitoring, host and network analysis, vulnerability assessment, and incident response through a curriculum aligned with Cisco CCNA Cybersecurity, security laboratories, CTF training, and projects that build practical defensive cybersecurity skills.",
  "DevNet Cadet":
    "Learns programming, APIs, application development, and infrastructure automation through a curriculum aligned with Cisco CCNA Automation, formerly known as DevNet Associate, and hands-on projects that build automation tools supporting networking, cybersecurity, and other organizational initiatives.",
};

const TRACK_BY_ROLE: Record<TechnologyRole, string> = {
  "Enterprise Networking Cadet": "Enterprise Networking",
  "CyberOps Cadet": "CyberOps",
  "DevNet Cadet": "DevNet",
};

const QUESTIONS_BY_TRACK: Record<string, readonly string[]> = {
  "Enterprise Networking": [
    "What experience do you have with networking concepts (e.g., OSI/TCP-IP, configuration, or troubleshooting), and what do you hope to learn as an Enterprise Networking cadet?",
    "What kind of hands-on laboratory or project would you want to work on to understand how a real enterprise network works?",
  ],
  CyberOps: [
    "What experience do you have with cybersecurity (e.g., CTFs, threat monitoring, or security tools), and what do you hope to learn as a CyberOps cadet?",
    "What kind of security challenge or incident-response exercise would you want the team to run, and what would you want to gain from it?",
  ],
  DevNet: [
    "What experience do you have with programming, APIs, or automation, and what do you hope to learn as a DevNet cadet?",
    "What kind of automation tool or project would you want to learn to build, and what skills would you want to gain from it?",
  ],
};

const getRegistrationCookieValue = (key: string) => {
  if (typeof document === "undefined") {
    return "";
  }

  const cookies = new Map(
    document.cookie
      .split("; ")
      .filter(Boolean)
      .map((cookieItem) => {
        const [rawName, ...rawValue] = cookieItem.split("=");
        return [decodeURIComponent(rawName), decodeURIComponent(rawValue.join("="))] as const;
      }),
  );

  return cookies.get(`${COOKIE_PREFIX}${key}`) ?? "";
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

    const firstName = getRegistrationCookieValue("firstName");
    const lastName = getRegistrationCookieValue("lastName");
    const email = getRegistrationCookieValue("email");

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 px-4 py-6 font-sans text-zinc-900">
      <main className="mx-auto w-full max-w-3xl rounded-2xl border border-sky-100 bg-white/95 p-6 shadow-lg shadow-blue-100 sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Registration - Technology Department</h1>

        <p className="mt-4 text-sm leading-6 text-slate-700">
          The Technology Department is responsible for driving technical excellence and innovation within CNCP.
          It consists of three areas: Enterprise Networking, CyberOps, and DevNet. The department focuses on
          providing mentorship, managing projects, and organizing hands-on learning experiences.
        </p>

        <p className="mt-4 text-sm leading-6 text-slate-700">
          For detailed information on each cadetship track, you can refer to{" "}
          <a
            className="font-medium text-sky-700 underline"
            href="https://docs.google.com/document/d/1dU6wpyFiGRfjeYCiymvxjvigK2m3VN2BdRBaZOwL8ww/edit?tab=t.0#heading=h.vixkji6185jn"
            target="_blank"
            rel="noopener noreferrer"
          >
            this primer
          </a>.
        </p>

        <form className="mt-6 space-y-4 text-sm" onSubmit={handleSubmit}>
          <fieldset className="space-y-3 rounded-xl border border-sky-200 bg-sky-50/70 p-4 sm:col-span-2">
            <legend className="px-2 text-sm font-semibold">
              What cadetship track would you like to apply for? <span className="text-red-600">*</span>
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
            <section className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              <h2 className="text-base font-semibold text-slate-900">{selectedRole}</h2>
              <p>{ROLE_DESCRIPTIONS[selectedRole]}</p>
            </section>
          )}

          {selectedRole && (
            <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:col-span-2">
              <p className="text-sm font-medium text-slate-900">
                These questions are intended to give us a general sense of your interest and experience. For
                applicants who qualify, a follow-up interview will be scheduled to get to know you even better.
              </p>

              {QUESTIONS_BY_TRACK[track].map((question, index) => (
                <label key={index} className="block space-y-2 text-sm">
                  <span className="font-medium">
                    {question} <span className="text-red-600">*</span>
                  </span>
                  <textarea
                    name={`technologyQuestion${index + 1}`}
                    className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-sky-500"
                    required
                  />
                </label>
              ))}
            </section>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={() => router.push("/register")}
            >
              Previous
            </button>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-md bg-sky-600 px-5 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Submit"}
            </button>
          </div>

          {submitError && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          )}
        </form>
      </main>
    </div>
  );
}

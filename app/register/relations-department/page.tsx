"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabasePublicClient } from "@/lib/supabase";
import { savePersonalInfoFromCookies } from "@/lib/save-personal-info";

type RelationsTeam = "External" | "Community";

const RELATIONS_TEAMS: readonly RelationsTeam[] = ["External", "Community"];

type ExternalRole =
  | "Community Partnership Lead"
  | "Community Partnership Co-Lead"
  | "Sponsors Lead"
  | "Sponsors Co-Lead";

type CommunityRole =
  | "Engagement Lead"
  | "Engagement Co-Lead"
  | "Membership Lead"
  | "Membership Co-Lead"
  | "Community Member";

type RelationsRole = ExternalRole | CommunityRole;

const EXTERNAL_ROLES: readonly ExternalRole[] = [
  "Community Partnership Lead",
  "Community Partnership Co-Lead",
  "Sponsors Lead",
  "Sponsors Co-Lead",
];

const COMMUNITY_ROLES: readonly CommunityRole[] = [
  "Engagement Lead",
  "Engagement Co-Lead",
  "Membership Lead",
  "Membership Co-Lead",
  "Community Member",
];

const ROLE_DESCRIPTIONS: Record<RelationsRole, string> = {
  "Community Partnership Lead":
    "Responsible for establishing and maintaining professional relationships between Cisco NetConnect PUP - Manila and other student organizations, academic communities, and relevant external groups. Identifies potential organizations for partnership, initiates communication, coordinates collaborative opportunities, and facilitates activities that strengthen the presence and network of Cisco NetConnect PUP - Manila within the student community.",
  "Community Partnership Co-Lead":
    "Assist the Community Partnership Lead in managing and developing external relationships for Cisco NetConnect PUP - Manila. Support the identification of potential partner organizations, facilitate communication, coordinate partnership activities, and assist in maintaining ongoing collaborations with external organizations.",
  "Sponsors Lead":
    "Responsible for identifying and establishing connections with potential sponsors who may support the activities and initiatives of Cisco NetConnect PUP - Manila. Communicates with prospective sponsors through formal correspondence, presents sponsorship opportunities, manages follow-ups, and assists in maintaining professional relationships with sponsors.",
  "Sponsors Co-Lead":
    "Assist the Sponsors Lead in managing sponsorship outreach and communications for Cisco NetConnect PUP - Manila. Support the identification of potential sponsors, assist in preparing and sending sponsorship emails and proposals, conduct follow-ups, organize sponsor information, and help coordinate communications with prospective and existing sponsors.",
  "Engagement Lead":
    "Oversees the overall member engagement strategy of Cisco NetConnect PUP - Manila. Sets engagement goals, plans the community engagement calendar, assigns responsibilities to Engagement Co-Leads and Community Members, and evaluates the effectiveness of engagement initiatives. Responsible for ensuring that members remain active, connected, and involved in the community.",
  "Engagement Co-Lead":
    "Responsible for leading specific engagement initiatives assigned by the Engagement Lead. Plan and facilitate activities such as discussions, games, polls, challenges, and community events. Coordinate with Community Members during implementation, track participation in their assigned initiatives, and provide feedback and results to the Engagement Lead.",
  "Membership Lead":
    "Oversees the overall membership growth and onboarding strategy of Cisco NetConnect PUP - Manila. Establishes recruitment goals, plans recruitment approaches, identifies potential channels for reaching students, organizes the onboarding process, and monitors membership growth. Responsible for ensuring that recruitment and onboarding are organized and aligned with the organization's goals.",
  "Membership Co-Lead":
    "Responsible for handling specific recruitment and onboarding initiatives assigned by the Membership Lead. Coordinate recruitment campaigns, communicate with potential applicants, assist with orientations and onboarding activities, follow up with new members, and maintain records related to their assigned recruitment efforts.",
  "Community Member":
    "Support the Engagement and Recruitment Leads in executing community initiatives and activities. Assist in facilitating events, promoting activities, welcoming new members, gathering feedback, and contributing ideas that help strengthen participation and connection within Cisco NetConnect PUP - Manila.",
};

const QUESTIONS_BY_ROLE: Record<RelationsRole, readonly string[]> = {
  "Community Partnership Lead": [
    "How would you identify and establish partnerships with other student organizations and academic communities to strengthen CNCP's presence?",
    "Describe a time you built or maintained a professional relationship with an external group. How did you approach it and what was the outcome?",
  ],
  "Community Partnership Co-Lead": [
    "How would you support the Community Partnership Lead in managing external relationships and coordinating partnership activities?",
    "How would you handle a situation where a potential partner organization is unresponsive to outreach?",
  ],
  "Sponsors Lead": [
    "How would you approach potential sponsors to secure support for CNCP's activities and initiatives?",
    "Describe a time you persuaded someone to support a cause or project. What strategies did you use and how did it go?",
  ],
  "Sponsors Co-Lead": [
    "How would you assist the Sponsors Lead in preparing sponsorship proposals and managing follow-ups?",
    "How would you organize and maintain sponsor information to ensure effective communication?",
  ],
  "Engagement Lead": [
    "How would you design and implement an engagement strategy that keeps members active and connected within the community?",
    "How would you evaluate the effectiveness of engagement initiatives and adjust strategies based on feedback?",
  ],
  "Engagement Co-Lead": [
    "How would you plan and facilitate an engaging community activity or event for CNCP members?",
    "How would you handle low participation in an engagement initiative you're leading?",
  ],
  "Membership Lead": [
    "How would you develop and execute a recruitment strategy to grow CNCP's membership base?",
    "How would you organize the onboarding process to ensure new members feel welcomed and integrated?",
  ],
  "Membership Co-Lead": [
    "How would you assist the Membership Lead in coordinating recruitment campaigns and onboarding activities?",
    "How would you follow up with potential applicants who have shown interest but haven't completed their application?",
  ],
  "Community Member": [
    "How would you contribute to community initiatives and help strengthen participation within CNCP?",
    "What ideas do you have for activities or events that could improve member engagement in the organization?",
  ],
};



export default function RelationsDepartmentPage() {
  const router = useRouter();
  const supabase = createSupabasePublicClient();
  const [selectedTeam, setSelectedTeam] = useState<RelationsTeam | "">("");
  const [selectedRole, setSelectedRole] = useState<RelationsRole | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const availableRoles = selectedTeam === "External" ? EXTERNAL_ROLES : selectedTeam === "Community" ? COMMUNITY_ROLES : [];

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

    if (!selectedTeam || !selectedRole) {
      setSubmitError("Please select a team and role before submitting.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const questionAnswers = {
      leadershipQuestion1: String(formData.get("relationsQuestion1") ?? ""),
      leadershipQuestion2: String(formData.get("relationsQuestion2") ?? ""),
    };

    // Save personal info from cookies (only saves when department form is submitted)
    const personalInfoResult = await savePersonalInfoFromCookies();
    if (personalInfoResult.error) {
      setIsSubmitting(false);
      setSubmitError(personalInfoResult.error);
      return;
    }

    const { error } = await supabase.from("registration_relations_department").insert({
      first_name: firstName,
      last_name: lastName,
      email,
      team: selectedTeam,
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
      department: "Relations",
      team: selectedTeam,
      role: selectedRole,
      status: "pending",
    });

    if (interviewError) {
      setIsSubmitting(false);
      setSubmitError(interviewError.message);
      return;
    }

    setIsSubmitting(false);

    router.push(`/register/relations-department/submit?role=${encodeURIComponent(selectedRole)}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0c0a1a] via-[#12102a] to-[#0f0d22] px-4 py-6 font-sans text-zinc-100">
      <main className="mx-auto w-full max-w-3xl rounded-2xl border border-indigo-500/20 bg-[#161335]/90 p-6 shadow-lg shadow-indigo-900/40 sm:p-8">
        <h1 className="text-2xl font-semibold text-indigo-100 sm:text-3xl">Registration - Relations Department</h1>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          The Relations Department focuses on building and strengthening partnerships and fostering a positive,
          engaged community within the organization. It consists of two teams: External and Community.
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
              What team would you like to apply for? <span className="text-rose-400">*</span>
            </legend>

            {RELATIONS_TEAMS.map((team) => (
              <label key={team} className="flex items-start gap-3 text-sm">
                <input
                  type="radio"
                  name="relationsTeam"
                  value={team}
                  className="mt-1"
                  checked={selectedTeam === team}
                  onChange={() => {
                    setSelectedTeam(team);
                    setSelectedRole("");
                  }}
                  required
                />
                <span>{team}</span>
              </label>
            ))}
          </fieldset>

          {selectedTeam && (
            <fieldset className="space-y-3 rounded-xl border border-indigo-500/20 bg-indigo-950/40 p-4 sm:col-span-2">
              <legend className="px-2 text-sm font-semibold">
                What position would you like to apply for? <span className="text-rose-400">*</span>
              </legend>

              {availableRoles.map((role) => (
                <label key={role} className="flex items-start gap-3 text-sm">
                  <input
                    type="radio"
                    name="relationsRole"
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
          )}

          {selectedRole && (
            <section className="space-y-3 rounded-md border border-indigo-500/15 bg-indigo-950/30 p-4 text-sm leading-6 text-slate-300">
              <h2 className="text-base font-semibold text-indigo-100">{selectedRole}</h2>
              <p>{ROLE_DESCRIPTIONS[selectedRole as RelationsRole]}</p>
            </section>
          )}

          {selectedRole && (
            <section className="space-y-4 rounded-xl border border-indigo-500/15 bg-slate-800/80 p-4 sm:col-span-2">
              <p className="text-sm font-medium text-indigo-100">
                These questions are intended to give us a general sense of your interest and experience. For
                applicants who qualify, a follow-up interview will be scheduled to get to know you even better.
              </p>

              {QUESTIONS_BY_ROLE[selectedRole as RelationsRole].map(
                (question, index) => (
                  <label key={index} className="block space-y-2 text-sm">
                    <span className="font-medium">
                      {question} <span className="text-rose-400">*</span>
                    </span>
                    <textarea
                      name={`relationsQuestion${index + 1}`}
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

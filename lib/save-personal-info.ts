import { createSupabasePublicClient } from "@/lib/supabase";

const COOKIE_PREFIX = "registration_";

type PersonalInfoRecord = {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  facebook_link: string;
  facebook_shared_post: string;
  discord_username: string;
  linkedin_link: string | null;
  pup_webmail: string;
  phone: string;
  course_year_section: string;
  certificate_link: string;
  college_campus: string;
  membership_type: string;
};

const getCookieValue = (key: string): string => {
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

export const savePersonalInfoFromCookies = async (): Promise<{ error?: string }> => {
  const supabase = createSupabasePublicClient();

  const firstName = getCookieValue("firstName");
  const lastName = getCookieValue("lastName");
  const email = getCookieValue("email");
  const facebookLink = getCookieValue("facebookLink");
  const facebookSharedPost = getCookieValue("facebookSharedPost");
  const discordUsername = getCookieValue("discordUsername");
  const linkedinLink = getCookieValue("linkedinLink");
  const pupWebmail = getCookieValue("pupWebmail");
  const phone = getCookieValue("phone");
  const courseYearSection = getCookieValue("courseYearSection");
  const certificateLink = getCookieValue("certificateLink");
  const collegeCampus = getCookieValue("collegeCampus");
  const membershipType = getCookieValue("membershipType");

  if (!firstName || !lastName || !email) {
    return { error: "Missing personal information. Please complete the Personal Information page first." };
  }

  const personalInfoPayload: PersonalInfoRecord = {
    first_name: firstName,
    last_name: lastName,
    email,
    facebook_link: facebookLink,
    facebook_shared_post: facebookSharedPost,
    discord_username: discordUsername,
    linkedin_link: linkedinLink === "" ? null : linkedinLink,
    pup_webmail: pupWebmail,
    phone,
    course_year_section: courseYearSection,
    certificate_link: certificateLink,
    college_campus: collegeCampus,
    membership_type: membershipType,
  };

  // Check for existing record with same name
  const { data: previousRecord, error: previousRecordError } = await supabase
    .from("registration_personal_info")
    .select(
      "id,first_name,last_name,email,facebook_link,facebook_shared_post,discord_username,linkedin_link,pup_webmail,phone,course_year_section,certificate_link,college_campus,membership_type",
    )
    .eq("first_name", personalInfoPayload.first_name)
    .eq("last_name", personalInfoPayload.last_name)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<PersonalInfoRecord>();

  if (previousRecordError) {
    return { error: previousRecordError.message };
  }

  if (previousRecord) {
    // Update existing record
    const { error: updateError } = await supabase
      .from("registration_personal_info")
      .update(personalInfoPayload)
      .eq("id", previousRecord.id);

    if (updateError) {
      return { error: updateError.message };
    }
  } else {
    // Insert new record
    const { error: insertError } = await supabase.from("registration_personal_info").insert(personalInfoPayload);

    if (insertError) {
      return { error: insertError.message };
    }
  }

  return {};
};

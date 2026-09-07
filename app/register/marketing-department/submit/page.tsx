import SubmissionConfirmation from "@/app/register/submission-confirmation";

export default function MarketingDepartmentSubmitPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0c0a1a] via-[#12102a] to-[#0f0d22] px-4 py-6 font-sans text-zinc-100">
      <main className="mx-auto w-full max-w-3xl rounded-2xl border border-indigo-500/20 bg-[#161335]/90 p-6 shadow-lg shadow-indigo-900/40 sm:p-8">
        <h1 className="text-2xl font-semibold text-indigo-100 sm:text-3xl">Reach for the Sky!</h1>

        <p className="mt-4 text-sm leading-7 text-slate-300">
          To help your application soar, follow us on our socials and share our recruitment announcement on
          Facebook using this link: <a className="font-medium text-indigo-300 underline" href="https://tinyurl.com/37n79rdn" target="_blank" rel="noopener noreferrer">https://tinyurl.com/37n79rdn</a>. Make sure your post is set to public so our community can spot you.
        </p>

        <section className="mt-6 text-sm leading-7 text-slate-300">
          <p className="font-medium text-indigo-100">Stay connected with us here:</p>
          <p className="mt-3">Instagram: <a className="text-indigo-300 underline" href="https://www.instagram.com/cncp_mnl/" target="_blank" rel="noopener noreferrer">https://www.instagram.com/cncp_mnl/</a></p>
          <p>Twitter/X: <a className="text-indigo-300 underline" href="https://x.com/cncp_mnl" target="_blank" rel="noopener noreferrer">https://x.com/cncp_mnl</a></p>
          <p>LinkedIn: <a className="text-indigo-300 underline" href="https://www.linkedin.com/company/cncp-mnl" target="_blank" rel="noopener noreferrer">https://www.linkedin.com/company/cncp-mnl</a></p>
          <p>YouTube: <a className="text-indigo-300 underline" href="https://youtube.com/@cncp_mnl" target="_blank" rel="noopener noreferrer">https://youtube.com/@cncp_mnl</a></p>
        </section>

        <p className="mt-6 text-sm leading-7 text-slate-300">
          Also, join us on Discord if the position you&apos;re applying for requires an interview, or join to
          get the latest announcements: <a className="text-indigo-300 underline" href="https://discord.gg/xrVuuXwuvY" target="_blank" rel="noopener noreferrer">https://discord.gg/xrVuuXwuvY</a>.
        </p>

        <SubmissionConfirmation />
      </main>
    </div>
  );
}
import Link from 'next/link';

export default function CtaBand({ title, text }) {
  return (
    <section className="mt-8 flex flex-col gap-5 rounded-xl bg-[#1A2E4A] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div className="max-w-xl">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-300">{text}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-3">
        <Link href="/RequestProposal" className="rounded-md bg-[#F5A623] px-5 py-2.5 text-sm font-semibold text-[#1A2E4A] hover:bg-[#D4A017]">
          Request quotes
        </Link>
        <Link href="/list-your-company" className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
          List your company
        </Link>
      </div>
    </section>
  );
}

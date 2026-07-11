export default function PagePlaceholder({ title, description, footer }) {
  return (
    <div className="rounded-xl bg-white border border-[#E2E8F0] card-shadow p-8">
      <h1 className="text-lg font-semibold text-[#334155]">{title}</h1>
      <p className="text-sm text-slate-500 font-medium mt-2">{description}</p>
      <p className="text-sm text-slate-400 mt-6 italic">{footer}</p>
    </div>
  );
}

type NavUnit = {
  id: string;
  unit_number: number;
  title: string;
};

export function NotesMobileNav({ units }: { units: NavUnit[] }) {
  if (units.length === 0) return null;

  return (
    <div className="sticky top-[68px] z-40 -mx-4 mt-5 border-y border-slate-200/80 bg-[#f7f7fb]/95 px-4 py-3 backdrop-blur lg:hidden sm:-mx-6 sm:px-6">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {units.map((unit) => (
          <a
            key={unit.id}
            href={`#unit-${unit.unit_number}`}
            className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            {String(unit.unit_number).padStart(2, "0")} {unit.title}
          </a>
        ))}
      </div>
    </div>
  );
}

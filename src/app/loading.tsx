export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0C] text-[#E2E8F0] font-mono crt-screen select-none">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 border-2 border-zinc-800 border-t-red-500 animate-spin rounded-none"></div>
        <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">
          [ COMPILING TERMINAL DATA MATRIX... ]
        </span>
      </div>
    </div>
  );
}

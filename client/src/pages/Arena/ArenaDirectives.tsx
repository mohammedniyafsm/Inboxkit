export const ArenaDirectives = () => {
    return (
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-xs font-bold uppercase text-zinc-500 mb-2">Directives</h3>
            <ul className="space-y-2 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                    <span className="text-emerald-500">•</span>
                    Claim empty sectors to gain points.
                </li>
                <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    Rare sectors yield 2x points.
                </li>
                <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    Traps deduct points and stall systems (+5m).
                </li>
                <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    Maintain top rank for dominance.
                </li>
            </ul>
        </div>
    );
};

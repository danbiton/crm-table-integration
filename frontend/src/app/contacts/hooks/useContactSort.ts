import { useMemo } from "react";
import { Contact } from "../../../types/contact";
import { SortDirection } from "../components/SortableHeader";

export function useContactSort(
    contacts: Contact[],
    sortField: string | null,
    sortDirection: SortDirection
) {
    return useMemo(() => {
        if (!sortField || !sortDirection) {
            return [...contacts].sort((a, b) => {
                const blockA = Number(a.extensions?.Z_Block) || 0;
                const blockB = Number(b.extensions?.Z_Block) || 0;
                if (blockA !== blockB) return blockA - blockB;

                const plotA = Number(a.extensions?.Z_Plot) || 0;
                const plotB = Number(b.extensions?.Z_Plot) || 0;
                if (plotA !== plotB) return plotA - plotB;

                const subPlotA = Number(a.extensions?.Z_SubPlot) || 0;
                const subPlotB = Number(b.extensions?.Z_SubPlot) || 0;
                if (subPlotA !== subPlotB) return subPlotA - subPlotB;

                return (a.familyName ?? '').localeCompare(b.familyName ?? '', 'he');
            });
        }

        return [...contacts].sort((a, b) => {
            const aVal = sortField === 'formattedName'
                ? a.formattedName ?? ''
                : (a.extensions as any)?.[sortField] ?? '';

            const bVal = sortField === 'formattedName'
                ? b.formattedName ?? ''
                : (b.extensions as any)?.[sortField] ?? '';

            const aNum = Number(aVal);
            const bNum = Number(bVal);
            const isNumeric = !isNaN(aNum) && !isNaN(bNum) && aVal !== '';

            if (isNumeric) {
                return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
            }

            if (sortDirection === 'asc') return aVal.localeCompare(bVal, 'he');
            return bVal.localeCompare(aVal, 'he');
        });
    }, [contacts, sortField, sortDirection]);
}
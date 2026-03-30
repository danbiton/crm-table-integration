"use client";

import { FaArrowUp, FaArrowDown } from "react-icons/fa6";

export type SortDirection = "asc" | "desc" | null;

interface SortableHeaderProps {
    label: string;
    field: string;
    sortField: string | null;
    sortDirection: SortDirection;
    onSort: (field: string) => void;
}

export default function SortableHeader({ label, field, sortField, sortDirection, onSort }: SortableHeaderProps) {
    return (
        <div className="flex items-center justify-center gap-1 select-none">
            {label}
            <div className="flex gap-0.5">
                <FaArrowUp
                    className="w-3 h-3 cursor-pointer"
                    color={sortField === field && sortDirection === 'asc' ? 'white' : '#94a3b8'}
                    onClick={() => onSort(field)}
                />
                <FaArrowDown
                    className="w-3 h-3 cursor-pointer"
                    color={sortField === field && sortDirection === 'desc' ? 'white' : '#94a3b8'}
                    onClick={() => onSort(field)}
                />
            </div>
        </div>
    );
}
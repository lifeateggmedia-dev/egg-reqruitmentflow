"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CandidateStatus } from "@/lib/types";
import { STATUS_META } from "@/lib/constants";

interface FilterBarProps {
  onSearch: (query: string) => void;
  onStatusFilter: (status: CandidateStatus | "all") => void;
  statusFilter: CandidateStatus | "all";
}

export function FilterBar({ onSearch, onStatusFilter, statusFilter }: FilterBarProps) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          placeholder="Cari nama, WA, posisi..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
          className="pl-9 pr-9 rounded-xl border-zinc-200"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); onSearch(""); }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-zinc-400" />
          </button>
        )}
      </div>
      <Select value={statusFilter} onValueChange={(v) => onStatusFilter(v as CandidateStatus | "all")}>
        <SelectTrigger className="w-[160px] rounded-xl border-zinc-200">
          <SelectValue placeholder="Filter status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <SelectItem key={key} value={key}>
              {meta.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

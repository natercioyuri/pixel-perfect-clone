import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls = ({ currentPage, totalPages, onPageChange }: PaginationControlsProps) => {
  const pages = useMemo(() => {
    const result: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
    } else {
      result.push(1);
      if (currentPage > 3) result.push("ellipsis");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        result.push(i);
      }
      if (currentPage < totalPages - 2) result.push("ellipsis");
      result.push(totalPages);
    }
    return result;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {pages.map((page, i) =>
        page === "ellipsis" ? (
          <span key={`e-${i}`} className="w-8 text-center text-muted-foreground text-sm">…</span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange(page as number)}
            className="h-8 w-8 p-0 text-xs"
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default PaginationControls;

export function usePagination<T>(items: T[], pageSize: number, currentPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  );
  return { paginatedItems, totalPages, safePage };
}

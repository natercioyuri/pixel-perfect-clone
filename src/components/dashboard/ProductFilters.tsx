import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X, Calendar, Globe, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ProductFilterState {
  priceMin: number;
  priceMax: number;
  country: string;
  discoveredAfter: string;
}

export const defaultProductFilters: ProductFilterState = {
  priceMin: 0,
  priceMax: 1000,
  country: "all",
  discoveredAfter: "",
};

export function applyProductFilters(
  products: any[],
  filters: ProductFilterState
) {
  return products.filter((p) => {
    const price = Number(p.price) || 0;
    if (price < filters.priceMin || price > filters.priceMax) return false;
    if (filters.country !== "all" && p.country && p.country !== filters.country) return false;
    if (filters.discoveredAfter) {
      const createdAt = new Date(p.created_at).getTime();
      const filterDate = new Date(filters.discoveredAfter).getTime();
      if (createdAt < filterDate) return false;
    }
    return true;
  });
}

interface ProductFiltersProps {
  filters: ProductFilterState;
  onFiltersChange: (filters: ProductFilterState) => void;
  countries: string[];
}

const ProductFilters = ({ filters, onFiltersChange, countries }: ProductFiltersProps) => {
  const [open, setOpen] = useState(false);

  const hasActiveFilters =
    filters.priceMin > 0 ||
    filters.priceMax < 1000 ||
    filters.country !== "all" ||
    filters.discoveredAfter !== "";

  const resetFilters = () => onFiltersChange(defaultProductFilters);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(!open)}
          className={hasActiveFilters ? "border-primary text-primary" : ""}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros Avançados
          {hasActiveFilters && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              !
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="w-4 h-4 mr-1" /> Limpar
          </Button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-xl p-4 mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Faixa de Preço (R$)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Mín"
                    value={filters.priceMin || ""}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, priceMin: Number(e.target.value) || 0 })
                    }
                    className="bg-background/50 h-8 text-xs"
                  />
                  <span className="text-muted-foreground text-xs">—</span>
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={filters.priceMax === 1000 ? "" : filters.priceMax}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, priceMax: Number(e.target.value) || 1000 })
                    }
                    className="bg-background/50 h-8 text-xs"
                  />
                </div>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Globe className="w-3 h-3" /> País
                </label>
                <Select
                  value={filters.country}
                  onValueChange={(v) => onFiltersChange({ ...filters, country: v })}
                >
                  <SelectTrigger className="bg-background/50 h-8 text-xs">
                    <SelectValue placeholder="Todos os países" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os países</SelectItem>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Discovery Date */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Descoberto a partir de
                </label>
                <Input
                  type="date"
                  value={filters.discoveredAfter}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, discoveredAfter: e.target.value })
                  }
                  className="bg-background/50 h-8 text-xs"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductFilters;

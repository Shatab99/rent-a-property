import PropertyCard from "@/components/site/PropertyCard";
import { properties } from "@/data/properties";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, LayoutGrid, Map } from "lucide-react";

export default function Listings() {
  return (
    <div className="bg-white">
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button variant="outline" className="gap-2"><SlidersHorizontal size={16} /> Filters</Button>
            <Button variant="outline" className="gap-2 hidden sm:inline-flex"><LayoutGrid size={16} /> Grid</Button>
            <Button variant="outline" className="gap-2 hidden sm:inline-flex"><Map size={16} /> Map</Button>
          </div>
          <div className="text-sm text-muted-foreground">{properties.length} results</div>
        </div>
      </section>
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

import { Service } from "@/lib/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import Image from "next/image";

export function ServiceCatalog({ services }: { services: Service[] }) {
  if (!services || services.length === undefined || services.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No services available.</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-12 py-4">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {services.map((svc) => (
            <CarouselItem key={svc.id}>
              <Card className="overflow-hidden border-none shadow-md">
                <div className="relative aspect-[4/3] w-full bg-muted">
                  {svc.imageUrl ? (
                    <img
                      src={svc.imageUrl}
                      alt={svc.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary">
                      <span className="text-secondary-foreground text-opacity-50">No Image</span>
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                    <div className="mb-2 inline-block rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground backdrop-blur-sm">
                      {svc.category}
                    </div>
                    <h3 className="font-display text-3xl font-bold leading-tight shadow-black/50 drop-shadow-md sm:text-4xl">
                      {svc.name}
                    </h3>
                    <div className="mt-4 flex items-center gap-6">
                      <div className="text-2xl font-semibold text-emerald-400">
                        ₹{svc.price}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Clock className="h-4 w-4" />
                        <span>{svc.durationMin} mins</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="h-12 w-12 border-2" />
        <CarouselNext className="h-12 w-12 border-2" />
      </Carousel>
    </div>
  );
}

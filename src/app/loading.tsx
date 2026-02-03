import { TractorLoader } from "@/components/ui/tractor-loader";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50/80 backdrop-blur-sm">
      <TractorLoader size="lg" />
    </div>
  );
}

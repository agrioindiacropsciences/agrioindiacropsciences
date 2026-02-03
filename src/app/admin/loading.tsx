import { TractorLoader } from "@/components/ui/tractor-loader";

export default function AdminLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <TractorLoader size="md" />
    </div>
  );
}

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TractorScroll } from "@/components/ui/tractor-scroll";
import AiChatWidget from "@/components/AiChatWidget";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <AiChatWidget />
      <TractorScroll />
    </div>
  );
}


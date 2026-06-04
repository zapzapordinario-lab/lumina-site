import { createFileRoute } from "@tanstack/react-router";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { FloatingNav } from "@/components/FloatingNav";
import { Sections } from "@/components/Sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DezPila — IPTV Premium 600K+ Conteúdos em HD/4K" },
      { name: "description", content: "Cancele os streamings e tenha tudo em uma só tela. 600 mil conteúdos, todo o futebol ao vivo, HD/4K, suporte humano 24h e ativação em 5 minutos via PIX." },
      { property: "og:title", content: "DezPila — IPTV Premium" },
      { property: "og:description", content: "Cancele os streamings e tenha tudo em uma só tela. Canais, filmes, séries e todo o futebol em HD/4K." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen">
      <InteractiveBackground />
      <FloatingNav />
      <Sections />
    </div>
  );
}

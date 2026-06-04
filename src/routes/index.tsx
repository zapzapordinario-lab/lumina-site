import { createFileRoute } from "@tanstack/react-router";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { FloatingNav } from "@/components/FloatingNav";
import { Sections } from "@/components/Sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NovaPulse — Estúdio Digital Premium de Alta Performance" },
      { name: "description", content: "Criamos sites e aplicações de alta performance que convertem. Design premium, código impecável e suporte humano 24h." },
      { property: "og:title", content: "NovaPulse — Estúdio Digital Premium" },
      { property: "og:description", content: "Experiências digitais de alta performance que transformam visitantes em clientes." },
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

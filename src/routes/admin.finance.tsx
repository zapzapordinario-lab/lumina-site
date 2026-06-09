import { createFileRoute } from "@tanstack/react-router";
import { FinancePanel } from "@/components/FinancePanel";

export const Route = createFileRoute("/admin/finance")({
  ssr: false,
  component: FinancePage,
});

function FinancePage() {
  return <FinancePanel />;
}

import { AppShell } from "@/components/app-shell";

export default function CrmLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}

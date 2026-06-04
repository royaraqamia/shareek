import { getOrganization } from "@/features/settings/actions";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const result = await getOrganization();
  const organization = result.success ? (result as any).data : null;

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl md:px-8">
      <SettingsClient initialOrganization={organization} />
    </main>
  );
}

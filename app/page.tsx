import { NfcMemoryApp } from "@/components/nfc-memory-app";
import { getStudentPublicProfile } from "@/lib/student-service";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams?: Promise<{
    id?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const publicId = params?.id ?? "gxu-2026-lin-yu";
  const profile = await getStudentPublicProfile(publicId);

  return <NfcMemoryApp initialId={publicId} initialProfile={profile} />;
}

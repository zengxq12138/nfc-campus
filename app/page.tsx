import { NfcMemoryApp } from "@/components/nfc-memory-app";

type HomeProps = {
  searchParams?: Promise<{
    id?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  return <NfcMemoryApp initialId={params?.id ?? "gxu-2026-lin-yu"} />;
}


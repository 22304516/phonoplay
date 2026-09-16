import WordleBuilder from "./WordleBuilder";

type WordlePageProps = {
  searchParams: Promise<{
    activityId?: string;
  }>;
};

export default async function WordlePage({
  searchParams,
}: WordlePageProps) {
  const params = await searchParams;

  return <WordleBuilder activityId={params.activityId} />;
}
import WordSearchBuilder from "./WordSearchBuilder";

type WordSearchPageProps = {
  searchParams: Promise<{
    activityId?: string;
  }>;
};

export default async function WordSearchPage({
  searchParams,
}: WordSearchPageProps) {
  const params = await searchParams;

  return <WordSearchBuilder activityId={params.activityId} />;
}
type AuctionDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AuctionDetailsPage({ params }: AuctionDetailsPageProps) {
  const { id } = await params;

  return <div className="p-6">Auction Details: {id}</div>;
}

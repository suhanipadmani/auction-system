import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { toast } from "sonner";

export const useAuctionSocket = (auctionId: string) => {
  const [highestBid, setHighestBid] = useState<number | null>(null);
  const [highestBidderId, setHighestBidderId] = useState<string | null>(null);
  const [highestBidderName, setHighestBidderName] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!auctionId) return;

    // Connect and join
    socket.connect();
    socket.emit("join-auction", auctionId);

    const handleUpdate = (data: { highestBid: number; highestBidderId: string; highestBidderName: string }) => {
      setHighestBid(data.highestBid);
      setHighestBidderId(data.highestBidderId);
      setHighestBidderName(data.highestBidderName);
      setIsPending(false);
      toast.success(`New highest bid: ${data.highestBid}`);
    };

    const handleError = (data: { message: string }) => {
      setIsPending(false);
      toast.error(data.message);
    };

    // Listen for updates
    socket.on("new-bid-update", handleUpdate);
    socket.on("bid-error", handleError);

    return () => {
      socket.emit("leave-auction", auctionId);
      socket.off("new-bid-update", handleUpdate);
      socket.off("bid-error", handleError);
      socket.disconnect();
    };
  }, [auctionId]);

  const placeBid = (bidderId: string, amount: number) => {
    setIsPending(true);
    socket.emit("place-bid", { auctionId, amount, bidderId });
  };

  return { highestBid, highestBidderId, highestBidderName, isPending, placeBid };
};

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useCreateAuction } from "@/hooks/useAuction";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const auctionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  basePrice: z.coerce.number().positive("Base price must be greater than 0"),
  minIncrement: z.coerce.number().positive("Minimum increment must be greater than 0"),
  startTime: z.string(),
  endTime: z.string(),
}).refine((data) => {
  const start = new Date(data.startTime).getTime();
  const end = new Date(data.endTime).getTime();
  const now = Date.now();
  return start > now && end > start;
}, {
  message: "Start time must be in the future and before end time",
  path: ["startTime"],
});

type AuctionFormData = z.infer<typeof auctionSchema>;

export function CreateAuctionForm() {
  const router = useRouter();
  const { mutate: createAuction, isPending } = useCreateAuction();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(auctionSchema),
    defaultValues: {
      basePrice: 0,
      minIncrement: 1,
    }
  });

  const onSubmit = (data: AuctionFormData) => {
    createAuction(data, {
      onSuccess: () => {
        toast.success("Auction created successfully and is pending approval!");
        router.push("/seller/auctions");
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create auction");
      },
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-white/5 bg-black/40 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Create New Auction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Title</label>
            <Input
              {...register("title")}
              placeholder="e.g. Vintage 1960s Camera"
              className="bg-white/5 border-white/10"
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <Textarea
              {...register("description")}
              placeholder="Tell bidders about your item..."
              className="bg-white/5 border-white/10 min-h-[120px]"
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Base Price (₹)</label>
              <Input
                type="number"
                {...register("basePrice")}
                className="bg-white/5 border-white/10"
              />
              {errors.basePrice && <p className="text-sm text-red-500">{errors.basePrice.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Min Increment (₹)</label>
              <Input
                type="number"
                {...register("minIncrement")}
                className="bg-white/5 border-white/10"
              />
              {errors.minIncrement && <p className="text-sm text-red-500">{errors.minIncrement.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Start Time</label>
              <Input
                type="datetime-local"
                {...register("startTime")}
                className="bg-white/5 border-white/10"
              />
              {errors.startTime && <p className="text-sm text-red-500">{errors.startTime.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">End Time</label>
              <Input
                type="datetime-local"
                {...register("endTime")}
                className="bg-white/5 border-white/10"
              />
              {errors.endTime && <p className="text-sm text-red-500">{errors.endTime.message}</p>}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6"
          >
            {isPending ? "Creating..." : "Launch Auction Listing"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

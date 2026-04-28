"use client";

import { useRouter } from "next/navigation";

// External
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Validation
import { IAuctionFormData } from "@/types/auction";
import { auctionSchema } from "@/validations/auction.validation";


import { useCreateAuction } from "@/hooks/useAuction";
import { useCurrency } from "@/hooks/useCurrency";
import { useTranslations } from "next-intl";

// Components
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function CreateAuctionForm() {
  const router = useRouter();
  const { mutate: createAuction, isPending } = useCreateAuction();
  const { convertBack, symbol } = useCurrency();
  const t = useTranslations("auction.create");
  const te = useTranslations("common.errors");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IAuctionFormData>({
    resolver: zodResolver(auctionSchema) as any,


    defaultValues: {
      basePrice: 0,
      minIncrement: 1,
    }
  });

  const onSubmit = (data: IAuctionFormData) => {
    const transformedData = {
      ...data,
      basePrice: convertBack(Number(data.basePrice)),
      minIncrement: convertBack(Number(data.minIncrement))
    };

    createAuction(transformedData as any, {
      onSuccess: () => {
        toast.success(t("success"));
        router.push("/seller/auctions");
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || te("unknown"));
      },
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-white/5 bg-black/40 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          {t("formTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">{t("itemTitle")}</label>
            <Input
              {...register("title")}
              placeholder={t("itemTitlePlaceholder")}
              className="bg-white/5 border-white/10"
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">{t("description")}</label>
            <Textarea
              {...register("description")}
              placeholder={t("descriptionPlaceholder")}
              className="bg-white/5 border-white/10 min-h-[120px]"
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">{t("basePrice", { symbol })}</label>
              <Input
                type="number"
                {...register("basePrice")}
                className="bg-white/5 border-white/10"
              />
              {errors.basePrice && <p className="text-sm text-red-500">{errors.basePrice.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">{t("minIncrement", { symbol })}</label>
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
              <label className="text-sm font-medium text-gray-300">{t("startTime")}</label>
              <Input
                type="datetime-local"
                {...register("startTime")}
                className="bg-white/5 border-white/10"
              />
              {errors.startTime && <p className="text-sm text-red-500">{errors.startTime.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">{t("endTime")}</label>
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
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

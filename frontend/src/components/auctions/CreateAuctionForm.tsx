"use client";

import { useRouter } from "next/navigation";

// External
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

// Validation
import { IAuctionFormData } from "@/types/auction";
import { auctionSchema } from "@/validations/auction.validation";

// Hooks
import { useCreateAuction } from "@/hooks/useAuction";
import { useCurrency } from "@/hooks/useCurrency";

// Components
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DatePicker } from "@/components/ui/DatePicker";

export function CreateAuctionForm() {
  const router = useRouter();
  const { mutate: createAuction, isPending } = useCreateAuction();
  const { convertBack, symbol } = useCurrency();
  const t = useTranslations("auction.create");
  const te = useTranslations("common.errors");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<IAuctionFormData>({
    resolver: zodResolver(auctionSchema) as any,
    mode: "onChange",


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
    <Card className="w-full max-w-2xl mx-auto border-white/5 bg-black/40 backdrop-blur-xl overflow-visible">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          {t("formTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label={t("itemTitle")}
            {...register("title")}
            placeholder={t("itemTitlePlaceholder")}
            className="bg-white/5 border-white/10"
            error={errors.title?.message}
            required
          />

          <Textarea
            label={t("description")}
            {...register("description")}
            placeholder={t("descriptionPlaceholder")}
            className="bg-white/5 border-white/10 min-h-[120px]"
            error={errors.description?.message}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t("basePrice", { symbol })}
              type="number"
              {...register("basePrice")}
              className="bg-white/5 border-white/10"
              error={errors.basePrice?.message}
              required
            />

            <Input
              label={t("minIncrement", { symbol })}
              type="number"
              {...register("minIncrement")}
              className="bg-white/5 border-white/10"
              error={errors.minIncrement?.message}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="startTime"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <DatePicker
                    label={t("startTime")}
                    value={field.value}
                    onChange={field.onChange}
                    showTime
                    required
                  />
                  {errors.startTime?.message && (
                    <p className="text-xs text-destructive">{errors.startTime.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="endTime"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <DatePicker
                    label={t("endTime")}
                    value={field.value}
                    onChange={field.onChange}
                    showTime
                    required
                    align="right"
                  />
                  {errors.endTime?.message && (
                    <p className="text-xs text-destructive">{errors.endTime.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending || !isValid}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6"
          >
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

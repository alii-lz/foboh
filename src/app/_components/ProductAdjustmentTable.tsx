import { api } from "@/trpc/react";

interface PricingProfileDetails {
  basedOnId: string;
  basedOnTitle: string;
  adjustmentOperator: "INCREASE" | "DECREASE";
  adjustmentAmount: number | null;
  adjustmentType: "FIXED" | "DYNAMIC";
}

interface ProductAdjustmentTableProps {
  productIds: Set<string>;
  pricingProfileDetails: PricingProfileDetails;
  onNext: () => void;
}

export default function ProductAdjustmentTable({
  productIds,
  pricingProfileDetails,
  onNext,
}: ProductAdjustmentTableProps) {
  const selectedProductIdsArray = Array.from(productIds);

  console.log(pricingProfileDetails);

  const { data: products, isLoading: isLoadingProducts } =
    api.product.getByIds.useQuery(
      {
        ids: selectedProductIdsArray,
        basedOnProfileId: pricingProfileDetails.basedOnId,
      },
      {
        enabled: selectedProductIdsArray.length > 0,
      },
    );

  if (isLoadingProducts || !products) {
    return <div>Select products!</div>;
  }

  return (
    <div className="mt-6 w-full">
      <div className="grid grid-cols-6 gap-2 border-b border-gray-200 px-4 py-3 text-sm font-medium text-gray-600">
        <div className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4" />
          Product Title
        </div>
        <div>SKU Code</div>
        <div>Category</div>
        <div>Based on Price</div>
        <div>Adjustment</div>
        <div>New Price</div>
      </div>

      {products.map((p) => {
        const calculatedBasePrice = p.calculatedBasePrice;

        const adjustmentValue = pricingProfileDetails.adjustmentAmount ?? 0;
        let calculatedAdjustment: number;
        if (pricingProfileDetails.adjustmentType === "DYNAMIC") {
          calculatedAdjustment = (calculatedBasePrice * adjustmentValue) / 100;
        } else {
          calculatedAdjustment = adjustmentValue;
        }

        const finalAdjustment =
          pricingProfileDetails.adjustmentOperator === "DECREASE"
            ? -calculatedAdjustment
            : calculatedAdjustment;

        let newPrice = calculatedBasePrice + finalAdjustment;
        if (newPrice < 0) newPrice = 0;

        return (
          <div
            key={p.id}
            className="grid grid-cols-6 gap-2 border-b border-gray-100 px-4 py-3 text-sm text-gray-700"
          >
            <div className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" />
              {p.title}
            </div>

            <div>{p.skuCode}</div>

            <div>{p.categoryId}</div>

            <div className="font-medium text-gray-600">
              ${calculatedBasePrice.toFixed(2)}
            </div>

            <div className="rounded border border-green-600 bg-green-50 px-3 py-1 font-medium text-gray-700">
              {finalAdjustment < 0 ? "-" : "+"}$
              {Math.abs(finalAdjustment).toFixed(2)}
            </div>

            <div className="font-semibold text-gray-700">
              ${newPrice.toFixed(2)}
            </div>
          </div>
        );
      })}

      <p className="mt-6 px-4 text-sm text-gray-500">
        Your entries are saved automatically
      </p>

      <div className="mt-6 flex items-center justify-end gap-4 px-4">
        <button
          onClick={onNext}
          className="cursor-pointer rounded-full bg-[#009688] px-8 py-2 font-semibold text-white transition hover:bg-[#00796B]"
        >
          Next
        </button>
      </div>
    </div>
  );
}

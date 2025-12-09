import { Edit } from "lucide-react";

interface PricingProfileDetails {
  basedOnId: string;
  basedOnTitle: string;
  adjustmentOperator: "INCREASE" | "DECREASE";
  adjustmentAmount: number | null;
  adjustmentType: "FIXED" | "DYNAMIC";
}

interface PricingProfileSummaryProps {
  selectedProductCount: number;
  productNames: string[];
  pricingRule: PricingProfileDetails;
  onBack: () => void;
  onSaveAndPublish: () => void;
}

export default function PricingProfileSummary({
  selectedProductCount,
  productNames,
  pricingRule,
  onBack,
  onSaveAndPublish,
}: PricingProfileSummaryProps) {
  const getProductNamesDisplay = () => {
    if (productNames.length === 0) return "";
    if (productNames.length === 1) return productNames[0];
    if (productNames.length === 2)
      return `${productNames[0]} & ${productNames[1]}`;

    const remaining = productNames.length - 2;
    return `${productNames[0]}, ${productNames[1]} and ${remaining} more`;
  };

  const getAdjustmentText = () => {
    const type = pricingRule.adjustmentType === "DYNAMIC" ? "Dynamic" : "Fixed";
    const operator =
      pricingRule.adjustmentOperator === "INCREASE" ? "Increase" : "Decrease";
    const amount = pricingRule.adjustmentAmount ?? 0;
    const suffix = pricingRule.adjustmentType === "DYNAMIC" ? "%" : "";

    return (
      <>
        <span className="font-bold">
          {type} {operator} {"\u00A0"}
        </span>
        of {amount}
        {suffix}
      </>
    );
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div>
            <p className="text-sm text-gray-600">
              You&apos;ve selected
              <span className="font-semibold text-gray-900">
                {"\u00A0"} {selectedProductCount} Product
                {selectedProductCount !== 1 ? "s" : ""}
              </span>
            </p>
            <h2 className="mt-1 text-xl font-semibold text-gray-900">
              {getProductNamesDisplay()}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              With Price Adjustment Mode set to {getAdjustmentText()}
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <Edit size={16} />
          Make Changes
        </button>
      </div>
      <div className="mt-6 flex items-center justify-end gap-4">
        <button
          onClick={onBack}
          className="cursor-pointer rounded-full border border-gray-300 bg-white px-8 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onSaveAndPublish}
          className="cursor-pointer rounded-full bg-[#009688] px-8 py-2 font-semibold text-white transition hover:bg-[#00796B]"
        >
          Save & Publish Profile
        </button>
      </div>
    </div>
  );
}

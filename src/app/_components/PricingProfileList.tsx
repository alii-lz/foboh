"use client";

import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/trpc/react";

import type { PricingProfile } from "@prisma/client";

export default function PricingProfileList() {
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(
    null,
  );

  const { data: pricingProfiles, isLoading } =
    api.pricingProfile.getAll.useQuery();

  const deleteMutation = api.pricingProfile.delete.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (
      confirm(`Are you sure you want to delete the pricing profile "${title}"?`)
    ) {
      deleteMutation.mutate({ id });
    }
  };

  const toggleExpand = (profileId: string) => {
    setExpandedProfileId((prev) => (prev === profileId ? null : profileId));
  };

  const formatAdjustmentText = (profile: PricingProfile) => {
    const type = profile.adjustmentType === "DYNAMIC" ? "%" : "$";
    const operator = profile.adjustmentOperator === "INCREASE" ? "+" : "-";
    return `${operator}${profile.adjustmentAmount}${type}`;
  };

  if (isLoading || !pricingProfiles) {
    return (
      <div className="text-center text-gray-500">
        Loading pricing profiles...
      </div>
    );
  }

  if (pricingProfiles?.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <p className="text-xl text-gray-600">
          No pricing profiles yet. Create your first one!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pricingProfiles.map((profile) => {
        const isExpanded = expandedProfileId === profile.id;

        return (
          <div
            key={profile.id}
            className="rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
          >
            {/* Profile Header */}
            <div className="flex items-center justify-between p-6">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {profile.title}
                  </h2>
                  <span className="rounded-full bg-[#009688] px-3 py-1 text-sm font-medium text-white">
                    {formatAdjustmentText(profile)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Based on:
                  <span className="font-medium text-gray-900">
                    {"\u00A0"}
                    {profile.basedOnTitle}
                  </span>
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {profile._count.products} product
                  {profile._count.products !== 1 ? "s" : ""} assigned
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleExpand(profile.id)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  {isExpanded ? (
                    <>
                      Hide Products
                      <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      View Products
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(profile.id, profile.title)}
                  className="cursor-pointer rounded-lg border border-red-300 bg-white p-2 text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {isExpanded && <ExpandedProductList profileId={profile.id} />}
          </div>
        );
      })}
    </div>
  );
}

function ExpandedProductList({ profileId }: { profileId: string }) {
  const { data: profile, isLoading: isLoadingProfile } =
    api.pricingProfile.getById.useQuery({
      id: profileId,
    });

  const extendedProductIds = profile?.products.map((p) => p.id) ?? [];

  const { data: products, isLoading: isLoadingProducts } =
    api.product.getByIds.useQuery(
      {
        ids: extendedProductIds,
        basedOnProfileId: profile?.basedOnId,
      },
      {
        enabled: !!profile && extendedProductIds.length > 0,
      },
    );

  if (isLoadingProfile || isLoadingProducts) {
    return (
      <div className="border-t border-gray-200 bg-gray-50 p-6">
        <p className="text-center text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="border-t border-gray-200 bg-gray-50 p-6">
        <p className="text-center text-gray-500">Profile data not found.</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="border-t border-gray-200 bg-gray-50 p-6">
        <p className="text-center text-gray-500">
          No products assigned to this profile
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      <div className="p-6">
        <h3 className="mb-4 font-semibold text-gray-900">
          Assigned Products ({profile.products.length})
        </h3>
        <div className="space-y-2">
          {products.map((product) => {
            const basePrice = product.calculatedBasePrice;
            const adjustmentValue = profile.adjustmentAmount ?? 0;

            let calculatedAdjustment: number;
            if (profile.adjustmentType === "DYNAMIC") {
              calculatedAdjustment = (basePrice * adjustmentValue) / 100;
            } else {
              calculatedAdjustment = adjustmentValue;
            }

            const finalAdjustment =
              profile.adjustmentOperator === "DECREASE"
                ? -calculatedAdjustment
                : calculatedAdjustment;

            let newPrice = basePrice + finalAdjustment;
            if (newPrice < 0) newPrice = 0;

            return (
              <div
                key={product.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {product.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      SKU: {product.skuCode}
                      <span className="mx-2">•</span>
                      {product.categoryId}
                      {product.segmentId && (
                        <>
                          <span className="mx-2">•</span>
                          {product.segmentId}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 line-through">
                      Global Price: ${product.globalWholesalePrice.toFixed(2)}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      Updated Price: ${newPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Navbar from "@/app/_components/Navbar";
import Sidebar from "@/app/_components/Sidebar";
import ProductAdjustmentTable from "../_components/ProductAdjustmentTable";
import PricingProfileSummary from "../_components/PricingProfileSummary";
import PricingProfileList from "../_components/PricingProfileList";
import { api } from "@/trpc/react";

type SelectionMode = "one" | "multiple" | "all";
type AdjustmentValue = number | null;
type ViewMode = "list" | "create" | "preview";

interface PricingProfileDetails {
  basedOnId: string;
  basedOnTitle: string;
  adjustmentOperator: "INCREASE" | "DECREASE";
  adjustmentAmount: number | null;
  adjustmentType: "FIXED" | "DYNAMIC";
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedSku, setSelectedSku] = useState("");

  const [profileTitle, setProfileTitle] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showPriceAdjustmentPreview, setShowPriceAdjustmentPreview] =
    useState(false);

  const [selectionMode, setSelectionMode] = useState<SelectionMode>("multiple");
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set(),
  );

  const handleRuleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    let finalValue: string | AdjustmentValue = value;

    if (name === "adjustmentAmount") {
      if (value.trim() === "") {
        finalValue = null;
      } else {
        const parsedValue = parseFloat(value);
        finalValue = isNaN(parsedValue) ? 0 : parsedValue;
      }
    }

    if (name === "basedOn") {
      if (value === "GLOBAL") {
        setPricingRule((prevRule) => ({
          ...prevRule,
          basedOnId: "GLOBAL",
          basedOnTitle: "GLOBAL",
        }));
      } else {
        const selectedProfile = pricingProfiles?.find((p) => p.id === value);
        if (selectedProfile) {
          setPricingRule((prevRule) => ({
            ...prevRule,
            basedOnId: value,
            basedOnTitle: selectedProfile.title,
          }));
        }
      }
      return;
    }

    setPricingRule((prevRule) => ({
      ...prevRule,
      [name]: finalValue,
    }));
  };

  const handleAdjustmentTypeToggle = (type: "FIXED" | "DYNAMIC") => {
    setPricingRule((prevRule) => ({
      ...prevRule,
      adjustmentType: type,
    }));
  };

  const handleAdjustmentOperatorToggle = (
    operator: "INCREASE" | "DECREASE",
  ) => {
    setPricingRule((prevRule) => ({
      ...prevRule,
      adjustmentOperator: operator,
    }));
  };

  const initialPricingRuleState: PricingProfileDetails = {
    basedOnId: "GLOBAL",
    basedOnTitle: "GLOBAL",
    adjustmentType: "DYNAMIC",
    adjustmentAmount: 0,
    adjustmentOperator: "INCREASE",
  };

  const [pricingRule, setPricingRule] = useState<PricingProfileDetails>(
    initialPricingRuleState,
  );

  const { data: pricingProfiles } = api.pricingProfile.getAll.useQuery();

  const { data: products, isLoading: isLoadingProducts } =
    api.product.getAll.useQuery();

  const filteredProducts = products
    ? products.filter((product) => {
        const title = product.title?.toLowerCase() ?? "";
        const sku = product.skuCode?.toLowerCase() ?? "";
        const brand = product.brand?.toLowerCase().trim() ?? "";
        const category = product.categoryId?.toLowerCase() ?? "";
        const segment = product.segmentId?.toLowerCase() ?? "";

        // Helper function for wildcard matching
        const wildcardMatch = (text: string, pattern: string): boolean => {
          if (!pattern) return true;

          const lowerPattern = pattern.toLowerCase();

          // Convert wildcard pattern to regex
          // Escape special regex characters except *
          const regexPattern = lowerPattern
            .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
            .replace(/\*/g, ".*");

          const regex = new RegExp(`^${regexPattern}$`);
          return regex.test(text);
        };

        // Search term matches title OR sku with wildcard support
        const matchesSearch =
          searchTerm === "" ||
          wildcardMatch(title, searchTerm) ||
          title.includes(searchTerm.toLowerCase()) ||
          wildcardMatch(sku, searchTerm) ||
          sku.includes(searchTerm.toLowerCase());

        const matchesBrand =
          selectedBrand === "" || brand === selectedBrand.toLowerCase().trim();

        const matchesCategory =
          selectedCategory === "" ||
          category === selectedCategory.toLowerCase();

        const matchesSegment =
          selectedSegment === "" || segment === selectedSegment.toLowerCase();

        // SKU filter with wildcard support
        const matchesSku =
          selectedSku === "" ||
          wildcardMatch(sku, selectedSku) ||
          sku.includes(selectedSku.toLowerCase());

        return (
          matchesSearch &&
          matchesBrand &&
          matchesCategory &&
          matchesSegment &&
          matchesSku
        );
      })
    : [];

  const handleProductToggle = (productId: string) => {
    if (selectionMode === "all") return;

    setSelectedProductIds((prev) => {
      const newSet = new Set(prev);

      if (selectionMode === "one") {
        if (newSet.has(productId)) {
          newSet.delete(productId);
        } else {
          newSet.clear();
          newSet.add(productId);
        }
      } else {
        if (newSet.has(productId)) {
          newSet.delete(productId);
        } else {
          newSet.add(productId);
        }
      }

      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set(products!.map((p) => p.id));
    setSelectedProductIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedProductIds(new Set());
  };

  const isProductSelected = (productId: string) => {
    if (selectionMode === "all") return true;
    return selectedProductIds.has(productId);
  };

  const selectedCount =
    selectionMode === "all" ? filteredProducts.length : selectedProductIds.size;

  const getSelectedProductNames = () => {
    if (selectionMode === "all") {
      return filteredProducts.map((p) => p.title);
    }
    return (
      products
        ?.filter((p) => selectedProductIds.has(p.id))
        .map((p) => p.title) ?? []
    );
  };

  const utils = api.useUtils();
  const handleBack = () => {
    setShowPriceAdjustmentPreview(false);
  };

  const createPricingProfileMutation = api.pricingProfile.create.useMutation({
    onSuccess: () => {
      void utils.pricingProfile.getAll.invalidate();
      setViewMode("list");
      setShowPriceAdjustmentPreview(false);
      setProfileTitle("");
      setPricingRule(initialPricingRuleState);
      setSelectedProductIds(new Set());
      setSelectionMode("multiple");
      setSearchTerm("");
      setSelectedBrand("");
      setSelectedCategory("");
      setSelectedSegment("");
      setSelectedSku("");
    },
    onError: (error) => {
      console.error("Failed to save Pricing Profile:", error.message);
      alert(
        "Error saving profile. Ensure you have filled all required fields.",
      );
    },
  });

  const handleSaveAndPublish = () => {
    const productIdsArray = Array.from(selectedProductIds);

    // Check if any products are selected (essential for a profile)
    if (productIdsArray.length === 0) {
      alert("Please select at least one product before saving.");
      return;
    }

    if (profileTitle.trim() === "") {
      alert("Please enter a title for the pricing profile.");
      return;
    }

    const dataToSend = {
      title: profileTitle,
      basedOnId: pricingRule.basedOnId,
      basedOnTitle: pricingRule.basedOnTitle,
      adjustmentType: pricingRule.adjustmentType,
      adjustmentOperator: pricingRule.adjustmentOperator,
      adjustmentAmount: pricingRule.adjustmentAmount ?? 0,
      productIds: productIdsArray,
    };

    // 4. Call the tRPC mutation
    createPricingProfileMutation.mutate(dataToSend);
  };

  const handleCreateNew = () => {
    setViewMode("create");
    setPricingRule(initialPricingRuleState);
    setSelectedProductIds(new Set());
    setSelectionMode("multiple");
    setShowPriceAdjustmentPreview(false);
  };

  const handleCancelCreate = () => {
    setViewMode("list");
    setShowPriceAdjustmentPreview(false);
    setProfileTitle("");
    setPricingRule(initialPricingRuleState);
    setSelectedProductIds(new Set());
    setSelectionMode("multiple");
    setSearchTerm("");
    setSelectedBrand("");
    setSelectedCategory("");
    setSelectedSegment("");
    setSelectedSku("");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex flex-1 flex-col bg-white text-black">
        <Navbar />
        <div className="p-8">
          {/* Show List View */}
          {viewMode === "list" && (
            <>
              {/* Header with Create Button */}
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900">
                    Pricing Profiles
                  </h1>
                  <p className="mt-1 text-lg text-gray-500">
                    Manage your pricing strategies
                  </p>
                </div>
                <button
                  onClick={handleCreateNew}
                  className="cursor-pointer rounded-lg bg-[#009688] px-6 py-3 font-semibold text-white transition hover:bg-[#00796b]"
                >
                  + Create New Profile
                </button>
              </div>

              {/* Pricing Profile List Component */}
              <PricingProfileList />
            </>
          )}

          {/* Show Create/Edit View */}
          {viewMode === "create" && (
            <>
              {/* Header */}
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900">
                    Set Product Pricing
                  </h1>
                  <p className="mt-1 text-lg text-gray-500">Set details</p>
                </div>
                <button
                  onClick={handleCancelCreate}
                  className="cursor-pointer rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>

              {/* Conditional Rendering */}
              {showPriceAdjustmentPreview ? (
                <PricingProfileSummary
                  selectedProductCount={selectedCount}
                  productNames={getSelectedProductNames()}
                  pricingRule={pricingRule}
                  onBack={handleBack}
                  onSaveAndPublish={handleSaveAndPublish}
                />
              ) : (
                <>
                  {/* Pricing Profile Selection */}
                  <div className="mb-8 rounded-lg bg-gray-50 p-6">
                    <h2 className="mb-4 text-base font-medium text-gray-700">
                      You are creating a Pricing Profile for
                    </h2>

                    {/* Profile Title Input */}
                    <div className="mb-6">
                      <label
                        htmlFor="profileTitle"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Profile Title *
                      </label>
                      <input
                        type="text"
                        id="profileTitle"
                        value={profileTitle}
                        onChange={(e) => setProfileTitle(e.target.value)}
                        placeholder="Enter a name for this pricing profile"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-8">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="productSelection"
                          value="one"
                          checked={selectionMode === "one"}
                          onChange={(e) => {
                            setSelectionMode(e.target.value as SelectionMode);
                            setSelectedProductIds(new Set());
                          }}
                          className="h-5 w-5 cursor-pointer text-green-600 focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-base text-gray-700">
                          One Product
                        </span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="productSelection"
                          value="multiple"
                          checked={selectionMode === "multiple"}
                          onChange={(e) =>
                            setSelectionMode(e.target.value as SelectionMode)
                          }
                          className="h-5 w-5 cursor-pointer text-green-600 focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-base text-gray-700">
                          Multiple Products
                        </span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="productSelection"
                          value="all"
                          checked={selectionMode === "all"}
                          onChange={(e) => {
                            setSelectionMode(e.target.value as SelectionMode);
                            setSelectedProductIds(
                              new Set(
                                products ? products.map((p) => p.id) : [],
                              ),
                            );
                          }}
                          className="h-5 w-5 cursor-pointer text-green-600 focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-base text-gray-700">
                          All Products
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Search for Products */}
                  <div>
                    <h2 className="mb-4 text-base font-medium text-gray-700">
                      Search for Products
                    </h2>

                    <div className="flex gap-4">
                      <div className="relative max-w-xs flex-1">
                        <input
                          type="text"
                          placeholder="Search by title"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-10 text-gray-700 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                        <Search
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
                          size={20}
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="SKU"
                        value={selectedSku}
                        onChange={(e) => setSelectedSku(e.target.value)}
                        className="max-w-xs flex-1 rounded-lg border px-4 py-3"
                      />

                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="max-w-xs flex-1 rounded-lg border px-4 py-3"
                      >
                        <option value="">Category</option>
                        <option value="alcoholic beverage">
                          Alcoholic Beverage
                        </option>
                        <option value="wine">Wine</option>
                        <option value="beer">Beer</option>
                        <option value="spirits">Liquor & Spirits</option>
                        <option value="cider">Cider</option>
                        <option value="premixed">
                          Premixed & Ready-to-Drink
                        </option>
                        <option value="other">Other</option>
                      </select>

                      <select
                        value={selectedSegment}
                        onChange={(e) => setSelectedSegment(e.target.value)}
                        className="max-w-xs flex-1 rounded-lg border px-4 py-3"
                      >
                        <option value="">Segment</option>
                        <option value="red">Red</option>
                        <option value="white">White</option>
                        <option value="rose">Rose</option>
                        <option value="orange">Orange</option>
                        <option value="sparkling">Sparkling</option>
                        <option value="port">Port/Dessert</option>
                      </select>

                      <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="max-w-xs flex-1 rounded-lg border px-4 py-3"
                      >
                        <option value="">Brand</option>
                        <option value="high garden">High Garden</option>
                        <option value="koyama wines">Koyama Wines</option>
                        <option value="lacourte-godbillon">
                          Lacourte-Godbillon
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Product List */}
                  <div className="mt-8">
                    <div className="mb-4 flex items-center gap-2 text-gray-600">
                      <span>Showing</span>
                      <span className="rounded bg-gray-200 px-2 py-1 font-semibold text-gray-800">
                        {filteredProducts.length} Result
                        {filteredProducts.length !== 1 ? "s" : ""}
                      </span>
                      {searchTerm && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">
                          {searchTerm}
                        </span>
                      )}
                      {selectedBrand && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">
                          {selectedBrand}
                        </span>
                      )}
                    </div>

                    {selectionMode !== "one" && selectionMode !== "all" && (
                      <div className="mb-6 flex items-center gap-6">
                        <button
                          onClick={handleDeselectAll}
                          className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-gray-800"
                        >
                          <span>Deselect All</span>
                        </button>
                        <button
                          onClick={handleSelectAll}
                          className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-gray-800"
                        >
                          <span>Select all</span>
                        </button>
                      </div>
                    )}

                    {isLoadingProducts ? (
                      <div className="text-center text-gray-500">
                        Loading products...
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredProducts.map((product) => {
                          const isSelected = isProductSelected(product.id);
                          const isDisabled = selectionMode === "all";

                          return (
                            <div
                              key={product.id}
                              onClick={() =>
                                !isDisabled && handleProductToggle(product.id)
                              }
                              className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all ${
                                isSelected
                                  ? "border-green-600 bg-green-50"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              } ${isDisabled ? "cursor-not-allowed opacity-75" : ""}`}
                            >
                              <div className="flex-shrink-0">
                                <div
                                  className={`flex h-6 w-6 items-center justify-center rounded border-2 ${
                                    isSelected
                                      ? "border-green-600 bg-green-600"
                                      : "border-gray-300 bg-white"
                                  }`}
                                >
                                  {isSelected && (
                                    <svg
                                      className="h-4 w-4 text-white"
                                      fill="none"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  )}
                                </div>
                              </div>

                              <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-900">
                                  {product.title}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                  SKU {product.skuCode}
                                  <span className="mx-2">•</span>
                                  {product.categoryId}
                                  <span className="mx-2">•</span>
                                  {product.segmentId}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {selectedCount > 0 && (
                      <div className="mt-6 text-gray-600">
                        You&apos;ve selected
                        <span className="font-semibold text-gray-900">
                          {selectedCount} Product
                          {selectedCount !== 1 ? "s" : ""}
                        </span>
                        , these will be added
                        <span className="font-semibold text-gray-900">
                          {"{Profile Name}"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="h-2px mt-8 w-full bg-gray-700"></div>

                  {/* Pricing Adjustment Component */}
                  <div className="mt-8 space-y-6">
                    <div>
                      <label
                        htmlFor="basedOn"
                        className="mb-2 block font-medium text-gray-700"
                      >
                        Based on
                      </label>
                      <select
                        id="basedOn"
                        name="basedOn"
                        value={pricingRule.basedOnId}
                        onChange={handleRuleChange}
                        className="w-md rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                      >
                        <option value="GLOBAL">Global Wholesale Price</option>
                        {pricingProfiles && pricingProfiles.length > 0 && (
                          <optgroup label="Existing Pricing Profiles">
                            {pricingProfiles.map((profile) => (
                              <option key={profile.id} value={profile.id}>
                                {profile.title}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>

                    <div>
                      <p className="mb-3 font-medium text-gray-700">
                        Set Price Adjustment Mode
                      </p>

                      <div className="flex items-center gap-6">
                        <label
                          onClick={() => handleAdjustmentTypeToggle("FIXED")}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <div
                            className={`h-4 w-4 rounded-full border-2 ${
                              pricingRule.adjustmentType === "FIXED"
                                ? "border-green-600 bg-green-600"
                                : "border-gray-400"
                            }`}
                          />
                          <span className="text-gray-700">Fixed ($)</span>
                        </label>

                        <span className="text-gray-300">|</span>

                        <label
                          onClick={() => handleAdjustmentTypeToggle("DYNAMIC")}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <div
                            className={`h-4 w-4 rounded-full border-2 ${
                              pricingRule.adjustmentType === "DYNAMIC"
                                ? "border-green-600 bg-green-600"
                                : "border-gray-400"
                            }`}
                          />
                          <span className="text-gray-700">Dynamic (%)</span>
                        </label>
                      </div>
                    </div>

                    <div className="mt-6">
                      <p className="mb-3 font-medium text-gray-700">
                        Set Price Adjustment Increment Mode
                      </p>

                      <div className="flex items-center gap-6">
                        <label
                          onClick={() =>
                            handleAdjustmentOperatorToggle("INCREASE")
                          }
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <div
                            className={`h-4 w-4 rounded-full border-2 ${
                              pricingRule.adjustmentOperator === "INCREASE"
                                ? "border-green-600 bg-green-600"
                                : "border-gray-400"
                            }`}
                          />
                          <span className="text-gray-700">Increase +</span>
                        </label>

                        <span className="text-gray-300">|</span>

                        <label
                          onClick={() =>
                            handleAdjustmentOperatorToggle("DECREASE")
                          }
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <div
                            className={`h-4 w-4 rounded-full border-2 ${
                              pricingRule.adjustmentOperator === "DECREASE"
                                ? "border-green-600 bg-green-600"
                                : "border-gray-400"
                            }`}
                          />
                          <span className="text-gray-700">Decrease -</span>
                        </label>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="relative w-md">
                        <input
                          type="number"
                          step="0.01"
                          name="adjustmentAmount"
                          value={pricingRule.adjustmentAmount ?? "c"}
                          onChange={handleRuleChange}
                          placeholder={
                            pricingRule.adjustmentType === "FIXED"
                              ? "Enter fixed amount (e.g. 10)"
                              : "Enter percentage (e.g. 5)"
                          }
                          className={`w-full rounded-lg border p-3 pr-10 focus:border-black focus:ring-0`}
                        />

                        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-600">
                          {pricingRule.adjustmentType === "DYNAMIC" ? "%" : "$"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-start gap-2 text-sm text-amber-700">
                      <span>💡</span>
                      <p>
                        The adjusted price will be calculated from
                        <span className="rounded bg-gray-100 px-1 py-0.5 font-semibold text-gray-800">
                          Based on Price
                        </span>
                        selected above
                      </p>
                    </div>

                    <ProductAdjustmentTable
                      productIds={selectedProductIds}
                      pricingProfileDetails={pricingRule}
                      onNext={() => setShowPriceAdjustmentPreview(true)}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

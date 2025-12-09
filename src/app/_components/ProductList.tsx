// "use client";

// import { useState } from "react";
// import { api } from "@/trpc/react";

// type SelectionMode = "one" | "multiple" | "all";

// interface ProductListProps {
//   selectionMode: SelectionMode;
//   searchTerm?: string;
//   selectedBrand?: string;
// }

// export default function ProductList({
//   selectionMode,
//   searchTerm = "",
//   selectedBrand = "",
// }: ProductListProps) {
//   const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
//     new Set(),
//   );

//   const { data: products, isLoading } = api.product.getAll.useQuery();

//   const filteredProducts = products!.filter((product) => {
//     const matchesSearch =
//       searchTerm === "" ||
//       product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.skuCode.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesBrand =
//       selectedBrand === "" || product.title.includes(selectedBrand);

//     return matchesSearch && matchesBrand;
//   });

//   const handleProductToggle = (productId: string) => {
//     if (selectionMode === "all") return;

//     setSelectedProducts((prev) => {
//       const newSet = new Set(prev);

//       if (selectionMode === "one") {
//         // For "one" mode, only allow one selection
//         if (newSet.has(productId)) {
//           newSet.delete(productId);
//         } else {
//           newSet.clear();
//           newSet.add(productId);
//         }
//       } else {
//         // For "multiple" mode, toggle selection
//         if (newSet.has(productId)) {
//           newSet.delete(productId);
//         } else {
//           newSet.add(productId);
//         }
//       }

//       return newSet;
//     });
//   };

//   // Handle select all / deselect all
//   const handleSelectAll = () => {
//     const allIds = new Set(filteredProducts.map((p) => p.id));
//     setSelectedProducts(allIds);
//   };

//   const handleDeselectAll = () => {
//     setSelectedProducts(new Set());
//   };

//   // Determine if product is selected
//   const isProductSelected = (productId: string) => {
//     if (selectionMode === "all") return true;
//     return selectedProducts.has(productId);
//   };

//   const selectedCount =
//     selectionMode === "all" ? filteredProducts.length : selectedProducts.size;

//   return (
//     <div className="mt-8">
//       {/* Results Header */}
//       <div className="mb-4 flex items-center gap-2 text-gray-600">
//         <span>Showing</span>
//         <span className="rounded bg-gray-200 px-2 py-1 font-semibold text-gray-800">
//           {filteredProducts.length} Result
//           {filteredProducts.length !== 1 ? "s" : ""}
//         </span>
//         <span>for</span>
//         {searchTerm && (
//           <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">
//             {searchTerm}
//           </span>
//         )}
//         {selectedBrand && (
//           <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">
//             {selectedBrand}
//           </span>
//         )}
//       </div>

//       {/* Select All / Deselect All */}
//       {selectionMode !== "one" && (
//         <div className="mb-6 flex items-center gap-6">
//           <button
//             onClick={handleDeselectAll}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
//           >
//             <div className="h-5 w-5 rounded-full border-2 border-gray-400"></div>
//             <span>Deselect All</span>
//           </button>
//           <button
//             onClick={handleSelectAll}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
//           >
//             <div className="h-5 w-5 rounded-full border-2 border-gray-400"></div>
//             <span>Select all</span>
//           </button>
//         </div>
//       )}

//       {/* Product List */}
//       <div className="space-y-4">
//         {filteredProducts.map((product) => {
//           const isSelected = isProductSelected(product.id);
//           const isDisabled = selectionMode === "all";

//           return (
//             <div
//               key={product.id}
//               onClick={() => !isDisabled && handleProductToggle(product.id)}
//               className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all ${
//                 isSelected
//                   ? "border-green-600 bg-green-50"
//                   : "border-gray-200 bg-white hover:border-gray-300"
//               } ${isDisabled ? "cursor-not-allowed opacity-75" : ""}`}
//             >
//               {/* Checkbox */}
//               <div className="flex-shrink-0">
//                 <div
//                   className={`flex h-6 w-6 items-center justify-center rounded border-2 ${
//                     isSelected
//                       ? "border-green-600 bg-green-600"
//                       : "border-gray-300 bg-white"
//                   }`}
//                 >
//                   {isSelected && (
//                     <svg
//                       className="h-4 w-4 text-white"
//                       fill="none"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path d="M5 13l4 4L19 7"></path>
//                     </svg>
//                   )}
//                 </div>
//               </div>

//               {/* Product Image */}
//               <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded bg-gray-100">
//                 <div className="h-12 w-12 rounded bg-gray-300"></div>
//               </div>

//               {/* Product Details */}
//               <div className="flex-1">
//                 <h3 className="text-base font-semibold text-gray-900">
//                   {product.title}
//                 </h3>
//                 <p className="mt-1 text-sm text-gray-600">
//                   SKU {product.skuCode}
//                   <span className="mx-2">•</span>
//                   {product.categoryId}
//                 </p>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Selected Count Footer */}
//       {selectedCount > 0 && (
//         <div className="mt-6 text-gray-600">
//           You've selected{" "}
//           <span className="font-semibold text-gray-900">
//             {selectedCount} Product{selectedCount !== 1 ? "s" : ""}
//           </span>
//           , these will be added{" "}
//           <span className="font-semibold text-gray-900">
//             {"{Profile Name}"}
//           </span>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/trpc/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Product {
  id: string;
  title: string;
  skuCode: string;
  brand: string;
  categoryId: string;
  subCategoryId: string;
  segmentId: string | null;
  globalWholesalePrice: number;
}

export default function ProductCreator() {
  const [editingId, setEditingId] = useState<string | null>(null);

  const utils = api.useUtils();
  const { data: products, isLoading } = api.product.getAll.useQuery();

  const createProduct = api.product.create.useMutation({
    onSuccess: () => {
      void utils.product.getAll.invalidate();
      void form.reset(emptyFormValues);
    },
  });

  const updateProduct = api.product.update.useMutation({
    onSuccess: () => {
      void utils.product.getAll.invalidate();
      setEditingId(null);
      void form.reset(emptyFormValues);
    },
  });

  const deleteProduct = api.product.delete.useMutation({
    onSuccess: () => utils.product.getAll.invalidate(),
  });

  const form = useForm<Product>({
    defaultValues: {
      id: "",
      title: "",
      skuCode: "",
      brand: "",
      categoryId: "",
      subCategoryId: "",
      segmentId: "",
      globalWholesalePrice: 0,
    },
  });

  const emptyFormValues: Product = {
    id: "",
    title: "",
    skuCode: "",
    brand: "",
    categoryId: "",
    subCategoryId: "",
    segmentId: "",
    globalWholesalePrice: 0,
  };

  const onSubmit = (data: Product) => {
    if (editingId) {
      updateProduct.mutate({ id: editingId, data });
      return;
    }

    createProduct.mutate(data);
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    form.reset(product);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 pb-0">
        <Link
          href="/Dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition hover:bg-gray-200"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>
      </div>

      <div className="flex gap-10 p-8 pt-4">
        <div className="w-[40%] rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            {editingId ? "Edit Product" : "Create Product"}
          </h2>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {[
              "title",
              "skuCode",
              "brand",
              "categoryId",
              "subCategoryId",
              "segmentId",
            ].map((field) => (
              <input
                key={field}
                {...form.register(field as keyof Product)}
                placeholder={field
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (c) => c.toUpperCase())}
                className="w-full rounded-lg border p-3 focus:border-black focus:ring-0"
              />
            ))}

            <input
              type="number"
              step="0.01"
              {...form.register("globalWholesalePrice", {
                valueAsNumber: true,
              })}
              placeholder="Global Wholesale Price"
              className="w-full rounded-lg border p-3 focus:border-black focus:ring-0"
            />

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={createProduct.isPending || updateProduct.isPending}
                className="cursor-pointer rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                {editingId ? "Update Product" : "Create Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    form.reset(emptyFormValues);
                    setEditingId(null);
                  }}
                  className="cursor-pointer rounded-lg bg-gray-200 px-6 py-3 transition hover:bg-gray-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="w-[60%] rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">Products</h2>

          {isLoading || !products ? (
            <p>Loading...</p>
          ) : (
            <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-semibold">{product.title}</p>
                    <p className="text-sm text-gray-500">
                      {product.categoryId} / {product.subCategoryId}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${product.globalWholesalePrice}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(product)}
                      className="cursor-pointer rounded-lg bg-blue-100 px-4 py-2 text-blue-700 transition hover:bg-blue-200"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteProduct.mutate({ id: product.id })}
                      className="cursor-pointer rounded-lg bg-red-100 px-4 py-2 text-red-700 transition hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type { Context } from "@/app/api/trpc/[trpc]/route";

const createUpdateProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  skuCode: z.string().min(1, "SKU Code is required"),
  brand: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Category ID is required"),
  subCategoryId: z.string().min(1, "Sub-Category ID is required"),
  segmentId: z.string().nullable().optional(),
  globalWholesalePrice: z.number().min(0, "Price must be non-negative"),
  basedOnProfileId: z.string().optional(),
});

export const getByIdsSchema = z.object({
  ids: z.array(z.string().uuid("Invalid product ID format")),
  basedOnProfileId: z.string().optional(),
});

async function resolveBasePrice(
  ctx: Context,
  productId: string,
  profileId: string,
): Promise<number> {
  // if its global then just return the global price
  if (profileId === "GLOBAL") {
    const product = await ctx.db.product.findUnique({
      where: { id: productId },
      select: { globalWholesalePrice: true },
    });
    return product?.globalWholesalePrice ?? 0;
  }

  const profile = await ctx.db.pricingProfile.findUnique({
    where: { id: profileId },
    select: {
      basedOnId: true,
      adjustmentAmount: true,
      adjustmentType: true,
      adjustmentOperator: true,
    },
  });

  if (!profile) return 0;

  const parentPrice = await resolveBasePrice(ctx, productId, profile.basedOnId);

  let adjustment = 0;
  if (profile.adjustmentType === "DYNAMIC") {
    adjustment = (parentPrice * profile.adjustmentAmount) / 100;
  } else {
    adjustment = profile.adjustmentAmount;
  }

  const finalAdjustment =
    profile.adjustmentOperator === "DECREASE" ? -adjustment : adjustment;

  return Math.max(0, parentPrice + finalAdjustment);
}

export const productRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createUpdateProductSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.product.create({
        data: input,
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.product.findMany({
      orderBy: { title: "asc" },
    });
  }),

  getByIds: protectedProcedure
    .input(getByIdsSchema)
    .query(async ({ ctx, input }) => {
      const { ids, basedOnProfileId } = input;

      // Promise.all to resolve prices for all products in parallel
      const productsWithCalculatedPrices = await Promise.all(
        ids.map(async (productId) => {
          const product = await ctx.db.product.findUnique({
            where: { id: productId },
          });

          if (!product) return null;

          const calculatedBasePrice = await resolveBasePrice(
            ctx,
            productId,
            basedOnProfileId ?? "GLOBAL",
          );

          return {
            ...product,
            calculatedBasePrice,
          };
        }),
      );

      return productsWithCalculatedPrices.filter((p) => p !== null);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid("Invalid product ID format"),
        data: createUpdateProductSchema.partial(), // so we dont need all fields
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.product.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid("Invalid product ID format") }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.product.delete({
        where: { id: input.id },
      });
    }),
});

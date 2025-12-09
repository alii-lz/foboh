import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const AdjustmentTypeEnum = z.enum(["FIXED", "DYNAMIC"], {
  required_error: "Adjustment Type is required (FIXED or DYNAMIC)",
});
const AdjustmentOperatorEnum = z.enum(["INCREASE", "DECREASE"], {
  required_error: "Adjustment Operator is required (INCREASE or DECREASE)",
});

const createPricingProfileSchema = z.object({
  title: z.string().min(1, "Title is required"),
  adjustmentAmount: z.number().min(0, "Adjustment value must be non-negative"),
  basedOnId: z.string(),
  basedOnTitle: z.string().min(1, "Base profile is required"),
  adjustmentType: AdjustmentTypeEnum,
  adjustmentOperator: AdjustmentOperatorEnum,
  productIds: z.array(z.string().uuid("Invalid Product ID format")).optional(),
});

export const pricingProfileRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createPricingProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const { productIds, ...profileData } = input;

      return ctx.db.pricingProfile.create({
        data: {
          ...profileData,
          // Handle the M:M relationship by connecting the products via their IDs
          products: {
            connect: productIds?.map((id) => ({ id })) ?? [],
          },
        },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.pricingProfile.findMany({
      orderBy: { title: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid("Invalid ID format") }))
    .query(async ({ ctx, input }) => {
      return ctx.db.pricingProfile.findUnique({
        where: { id: input.id },
        include: { products: true },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid("Invalid ID format") }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.pricingProfile.delete({
        where: { id: input.id },
      });
    }),
});

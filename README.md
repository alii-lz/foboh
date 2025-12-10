# Pricing Profile & Product Management System

This project is a full-stack solution for managing dynamic pricing profiles. It allows users to create bespoke pricing structures where products can inherit prices from a "parent" profile, apply specific adjustments (fixed or dynamic), and apply those changes down a chain of dependencies.

## Application Links

- **Main Application**: https://foboh.vercel.app
- **Dashboard**: https://foboh.vercel.app/dashboard
- **Product Creator**: https://foboh.vercel.app/ProductCreator
- **API Documentation**: https://foboh.vercel.app/swagger

## Core Logic: Recursive Price Resolution

The most complex part of this application is correctly calculating a product's price when it is part of a "Bespoke" chain.

### The Challenge

If Profile C is based on Profile B, and Profile B is based on Profile A, we cannot simply calculate C based on the Global Wholesale Price. We must respect the intermediate adjustments.

### The Solution

I implemented a recursive helper function `resolveBasePrice` on the server.

#### How it works:

1. **Check Base**: The function looks at the current profile's `basedOnId`.
2. **Base Case**: If `basedOnId === "GLOBAL"`, it returns the product's static `globalWholesalePrice`.
3. **Recursive Step**: If it points to another profile ID, the function calls itself with that parent ID.
4. **Unwind**: As the recursion unwinds (returns), it applies the adjustments step-by-step down the chain.

#### Example Scenario:

- **Global Price**: $100
- **Profile A**: Based on Global, +20% (Result: $120)
- **Profile B**: Based on Profile A, -$10 Fixed (Result: $110)

When calculating for Profile B, the recursion goes:

1. Resolve B → calls Resolve A → calls Global ($100) → returns $100.
2. Resolve A applies +20% → returns $120.
3. Resolve B applies -$10 → returns $110.

## Use of AI

I used AI models like Claude and Gemini to accelerate specific parts of the development workflow:

- **Generate Large JSX Frontend Code**: Used to create the repetitive UI structure of the dashboard, sidebar, and table components.

- **Regex & String Matching**: Used to generate the fuzzy, wildcard matching logic for the search filtering system

- **Code Cleanup, Readability, and Documentation**: Used to refactor code, add comments, improve readability, and structure this documentation.

- **API Documentaion**: Used to create the swagger.yml file which outlines the backend endpoints.

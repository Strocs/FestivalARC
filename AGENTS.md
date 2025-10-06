# Agent Guidelines for FestivalARC

## Commands

- **Dev**: `pnpm dev` - Start Astro dev server
- **Build**: `pnpm build` - Type check with `astro check` then build
- **Type Check**: `pnpm type` - Run TypeScript compiler without emit
- **Test**: `pnpm test` - Run all Vitest tests
- **Single Test**: `pnpm test <path>` - Run specific test file (e.g., `pnpm test src/features/schedule/__tests__/lib/grid.test.ts`)

## Code Style

- **Imports**: Use `@/` alias for src imports, type imports with `import type`
- **Formatting**: Single quotes, no semicolons, 2-space indent, trailing commas, JSX single quotes, bracket same line
- **Types**: Use explicit TypeScript types, prefer interfaces for object shapes
- **Naming**: PascalCase for components/types, camelCase for functions/variables, kebab-case for files
- **React**: Functional components with TypeScript props interfaces
- **Astro**: `.astro` files for layout/pages, React `.tsx` for interactive components
- **Error Handling**: Validate inputs with dedicated validation functions (see `src/features/schedule/lib/validation.ts`)
- **File Organization**: Feature-based structure (`features/*/` with types/, lib/, components/, **tests**/`)
- **Testing**: Vitest for unit tests, Playwright for e2e, place tests in `__tests__/` directories

## Before Committing

Always run `pnpm build` to ensure type checking and build succeed.

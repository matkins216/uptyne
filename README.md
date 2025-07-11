This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Status Checks

To test the status check functionality:

1. Create a monitor in the dashboard
2. Run one of the status check scripts:

   **Option 1: Using the API endpoint (requires dev server running)**
   ```bash
   npm run dev  # Start the development server first
   npm run check-monitors
   ```

   **Option 2: Direct database access (no dev server needed)**
   ```bash
   npm run check-monitors-direct
   ```
   *Note: This requires your Supabase environment variables to be set*

3. Refresh the monitors page to see the check results

The system will perform HTTP requests to your monitored URLs and display the status (up/down/error) with timestamps.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

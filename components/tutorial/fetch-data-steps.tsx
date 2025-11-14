'use client';

export function FetchDataSteps() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Now that you have Supabase authentication working, here are some next steps for your clothing store:
      </p>
      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
        <li>Create database tables for products, categories, and orders</li>
        <li>Build product listing and detail pages</li>
        <li>Implement shopping cart functionality</li>
        <li>Add user profile management</li>
        <li>Set up payment processing</li>
        <li>Create admin dashboard for inventory management</li>
      </ol>
    </div>
  );
}

export default FetchDataSteps;
export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#ead7c5] rounded-xl p-6">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-3xl font-bold mt-2">1,245</p>
        </div>

        <div className="bg-white border border-[#ead7c5] rounded-xl p-6">
          <p className="text-sm text-gray-500">Products</p>
          <p className="text-3xl font-bold mt-2">320</p>
        </div>

        <div className="bg-white border border-[#ead7c5] rounded-xl p-6">
          <p className="text-sm text-gray-500">Monthly Sales</p>
          <p className="text-3xl font-bold mt-2">₹84,500</p>
        </div>
      </div>
    </div>
  );
}

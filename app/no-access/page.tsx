export default function NoAccessPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-3">🚫 Access Denied</h1>
      <p className="text-gray-600 text-lg">
        You do not have permission to access the admin panel.
      </p>
    </div>
  );
}
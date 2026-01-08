import { FC } from "react";

export const DeckelsSkeleton: FC = () => {
  const rows = Array.from({ length: 6 });

  return (
    <div className="pb-10">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/40">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></th>
                <th className="px-6 py-4 text-right"><div className="ml-auto h-4 w-16 bg-gray-200 rounded animate-pulse" /></th>
                <th className="px-6 py-4 text-center"><div className="mx-auto h-4 w-12 bg-gray-200 rounded animate-pulse" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-5 w-32 bg-gray-200 rounded" /></td>
                  <td className="px-6 py-4"><div className="ml-auto h-9 w-24 bg-gray-200 rounded-lg" /></td>
                  <td className="px-6 py-4"><div className="mx-auto h-8 w-8 bg-gray-200 rounded-full" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
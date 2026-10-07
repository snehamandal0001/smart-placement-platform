const TpoDashboardSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto p-8 mt-4 animate-pulse">
      {/* Header */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5 mb-8"></div>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded shadow h-24 border-t-4 border-gray-200 dark:border-gray-700"></div>
        ))}
      </div>

      {/* Two Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Table 1 Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden h-96">
          <div className="h-12 bg-gray-100 dark:bg-gray-700 w-full mb-4"></div>
          <div className="p-4 space-y-4">
            {[...Array(4)].map((_, i) => (
               <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            ))}
          </div>
        </div>
        {/* Table 2 Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden h-96">
          <div className="h-12 bg-gray-100 dark:bg-gray-700 w-full mb-4"></div>
          <div className="p-4 space-y-4">
            {[...Array(4)].map((_, i) => (
               <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TpoDashboardSkeleton;
const ProfileSkeleton = () => {
  return (
    <div className="max-w-3xl mx-auto p-8 mt-10 bg-white dark:bg-gray-800 rounded-lg shadow-md animate-pulse">
      {/* Title */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs Grid (Name, Email, CGPA, Resume) */}
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>

        {/* Full-width Skills Input */}
        <div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>

        {/* Save Button */}
        <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded w-full mt-6"></div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
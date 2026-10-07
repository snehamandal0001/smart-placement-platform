const ApplicationSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700 animate-pulse flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-4">
      
      {/* Left Side: Applicant Details */}
      <div className="flex-1 w-full">
        {/* Name */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 md:w-1/3 mb-3"></div>
        {/* Email */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 md:w-1/4 mb-3"></div>
        {/* Skills/CGPA */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 md:w-1/2 mb-4"></div>
        {/* Resume Link */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>

      {/* Right Side: Status Dropdown & Action Buttons */}
      <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-3">
        {/* Current Status Badge */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
        
        {/* Button Row */}
        <div className="flex gap-2 mt-2">
           <div className="h-9 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
           <div className="h-9 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
      
    </div>
  );
};

export default ApplicationSkeleton;
// src/components/ui/Pagination.tsx
import Link from "next/link";

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of page range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning
      if (currentPage <= 2) {
        end = 4;
      }
      
      // Adjust if at the end
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push("ellipsis1");
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push("ellipsis2");
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  
  // Construct URL with page parameter
  const getPageUrl = (page: number) => {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}page=${page}`;
  };

  return (
    <nav className="flex justify-center">
      <ul className="flex items-center space-x-1">
        {/* Previous button */}
        {currentPage > 1 && (
          <li>
            <Link
              href={getPageUrl(currentPage - 1)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Previous
            </Link>
          </li>
        )}
        
        {/* Page numbers */}
        {pageNumbers.map((page, index) => (
          <li key={index}>
            {page === "ellipsis1" || page === "ellipsis2" ? (
              <span className="px-3 py-2 text-gray-500">...</span>
            ) : (
              <Link
                href={getPageUrl(page as number)}
                className={`px-3 py-2 border rounded-md text-sm ${
                  currentPage === page
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </Link>
            )}
          </li>
        ))}
        
        {/* Next button */}
        {currentPage < totalPages && (
          <li>
            <Link
              href={getPageUrl(currentPage + 1)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Next
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
import React from "react";
import { cn } from "@/lib/utils";
import { partnershipsRepo } from "@/lib/repositories/partnerships";
import type { Partnership } from "@/lib/types";
import Image from "next/image";

interface PartnershipsProps {
  className?: string;
}

// Revalidate every 60 seconds to show new partnerships
export const revalidate = 60;

// Server component to fetch active partnerships
async function getActivePartnerships(): Promise<Partnership[]> {
  try {
    return await partnershipsRepo.findActive();
  } catch (error) {
    console.error('Failed to fetch partnerships:', error);
    return [];
  }
}

// Helper function to format year range
function formatYearRange(yearFrom: number, yearTo?: number): string {
  if (!yearTo) {
    return `${yearFrom} - Present`;
  }
  return `${yearFrom} - ${yearTo}`;
}

const Partnerships: React.FC<PartnershipsProps> = async ({ ...props }) => {
  const partnerships = await getActivePartnerships();

  // Don't render the section if there are no partnerships
  if (partnerships.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("container flex flex-col justify-center", props.className)}
    >
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold">Our Partnerships</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Organizations we collaborate with to advance scientific research and education
        </p>
      </div>
      
      <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {partnerships
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((partnership) => {
            const CardWrapper = partnership.websiteUrl ? 'a' : 'div';
            const cardProps = partnership.websiteUrl 
              ? { 
                  href: partnership.websiteUrl, 
                  target: '_blank', 
                  rel: 'noopener noreferrer',
                  className: 'flex flex-col items-center gap-3 md:gap-4 rounded-lg border border-gray-200 bg-white p-4 md:p-5 hover:shadow-md transition-shadow cursor-pointer'
                }
              : { className: 'flex flex-col items-center gap-3 md:gap-4 rounded-lg border border-gray-200 bg-white p-4 md:p-5' };
            
            return (
              <CardWrapper
                key={partnership.id}
                {...cardProps}
              >
                {/* Logo */}
                <div className="w-full min-h-[120px] md:min-h-[140px] flex items-center justify-center flex-shrink-0 px-4 py-3">
                  {(partnership.logoBase64 || partnership.logoUrl) ? (
                    <img
                      src={partnership.logoBase64 || partnership.logoUrl}
                      alt={`${partnership.name} logo`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '120px',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 font-semibold text-lg">
                      {partnership.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                {/* Partnership Details */}
                <div className="text-center flex-1">
                  <h3 className="text-base md:text-lg font-bold text-neutral-900">
                    {partnership.name}
                  </h3>
                  <p className="text-xs md:text-sm font-medium text-primary mt-1">
                    {formatYearRange(partnership.yearFrom, partnership.yearTo)}
                  </p>
                </div>
              </CardWrapper>
            );
          })}
      </div>
    </div>
  );
};

export default Partnerships; 
import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  image?: string;
  bgColor: string;
  textColor: string;
  children?: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ title, description, image, bgColor, textColor, className, children, ...props }, ref) => {
    return (
        <div
        ref={ref}
        style={{
          backgroundColor: bgColor,
        }}
        className={cn("p-4 rounded-[16px] flex flex-wrap items-start gap-3 group", className)}
        {...props}
      >
        {/* Image in container */}
        {image && (
          <div className="w-[112px] h-[112px] rounded-[12px] overflow-hidden flex-shrink-0">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.2]"
            />
          </div>
        )}

        {/* Text block */}
        <div
          className="flex flex-col gap-3"
          style={{
            flex: "1 1 0",
            minWidth: "178px",
          }}
        >
          <p
            className="text-[32px] leading-[32px] font-bold uppercase"
            style={{ color: textColor }}
          >
            {title}
          </p>
          <p
            className="text-[24px] leading-[24px] font-bold uppercase"
            style={{ color: textColor }}
          >
            {description}
          </p>
        </div>

        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
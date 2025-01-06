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
          className={cn("p-4 rounded-[16px] flex flex-wrap items-start gap-3", className)}
          {...props}
        >
          {/* Изображение */}
          {image && (
            <img
              src={image}
              alt={title}
              className="w-[112px] h-[112px] rounded-[12px] flex-shrink-0"
            />
          )}
  
          {/* Текстовый блок */}
          <div
            className="flex flex-col gap-3"
            style={{
              flex: "1 1 0", // Гарантирует равномерное распределение текста
              minWidth: "178px", // Минимальная ширина текста
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
  
          {/* Слоты для вложенного содержимого */}
          {children}
        </div>
      );
    }
  );

Card.displayName = "Card";

export { Card };

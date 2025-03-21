import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from 'lucide-react'
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center transition-colors focus-visible:outline-none disabled:pointer-events-none font-bold uppercase",
  {
    variants: {
      variant: {
        default: [
          'border-2 border-black text-black rounded-[10px]',
          'hover:bg-[#f5f5f5]',
          'active:transform active:translate-y-0.5'
        ],
        primary: [
          'bg-[#202020] text-[#E9E9E9] rounded-[16px]',
          'hover:bg-[#3A3A3A]',
          'active:transform active:translate-y-0.5'
        ],
        'primary-light': [  // Add new variant
          'bg-[#ECECEC] text-[#202020] rounded-[16px]',
          'hover:bg-[#f5f5f5]',
          'active:transform active:translate-y-0.5'
        ],
        colored: [
          'rounded-[12px]',
          'hover:opacity-90',
          'active:transform active:translate-y-0.5'
        ]
      },
      size: {
        default: 'pt-[9px] pb-[7px] px-4 text-[16px] leading-[20px]',
        sm: 'pt-[9px] pb-[7px] px-3 text-[14px] leading-[16px] rounded-[10px]',
        lg: 'pt-[9px] pb-[7px] px-8 text-[24px] leading-[36px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    }
  }
 ) 

interface ButtonProps
 extends React.ButtonHTMLAttributes<HTMLButtonElement>,
   VariantProps<typeof buttonVariants> {
 asChild?: boolean
 bgColor?: string
 textColor?: string
 withLoader?: boolean
 isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant, size, bgColor, textColor, withLoader, isLoading, children, ...props }, ref) => {
   const customColorClasses = variant === 'colored' && bgColor ? 
     `${bgColor} ${textColor}` : ''

   return (
     <button
       className={cn(
         buttonVariants({ variant, size, className }),
         customColorClasses
       )}
       ref={ref}
       {...props}
     >
       {withLoader && isLoading ? (
         <Loader2 className="h-4 w-4 animate-spin" />
       ) : (
         children
       )}
     </button>
   )
 }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
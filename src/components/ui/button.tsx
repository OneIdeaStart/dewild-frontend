import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center text-sm transition-colors focus-visible:outline-none disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: [
          'border border-black bg-white text-black shadow-[-4px_4px_0px_0px_#000000]',
          'hover:bg-[#D8D8D8]',
          'active:bg-[#D8D8D8] active:shadow-none'
        ],
        primary: [
          'bg-[#002BFF] text-white shadow-[-4px_4px_0px_0px_#000000]',
          'hover:bg-[#0020BF]',
          'active:bg-[#0020BF] active:shadow-none'
        ],
      },
      size: {
        default: 'py-2 px-3',
        sm: 'py-2 px-3',
        lg: 'py-3 px-6',
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
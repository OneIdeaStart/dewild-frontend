// src/components/ui/typography.tsx
interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    variant: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    color?: 'primary' | 'secondary' | 'light' | 'gray';
    children: React.ReactNode;
  }
  
  export const Text = ({ variant, color = 'primary', className, children, ...props }: TextProps) => {
    const sizes = {
      'xs': 'text-[14px] leading-[16px]',
      'sm': 'text-[16px] leading-[20px]',
      'md': 'text-[24px] leading-[24px]',
      'lg': 'text-[32px] leading-[32px]',
      'xl': 'text-[72px] leading-[48px]',
      '2xl': 'text-[96px] leading-[64px]',
    }
  
    const colors = {
      'primary': 'text-[#202020]',
      'secondary': 'text-[#606060]',
      'light': 'text-[#E9E9E9]',
      'gray': 'text-[#A9A9A9]',
    }
  
    return (
      <p 
        className={`font-bold uppercase ${sizes[variant]} ${colors[color]} ${className}`}
        {...props}
      >
        {children}
      </p>
    )
  }
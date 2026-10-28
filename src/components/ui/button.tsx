import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 min-h-[44px]',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground hover:opacity-90',
        accent: 'bg-accent text-accent-foreground hover:opacity-90',
        primary: 'bg-primary text-primary-foreground hover:opacity-90',
        outline: 'border border-input bg-card hover:bg-muted',
        ghost: 'hover:bg-muted',
        link: 'text-link underline-offset-4 hover:underline min-h-0',
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
      },
      size: {
        default: 'px-5 py-2.5',
        sm: 'px-3 py-1.5 text-xs min-h-[36px]',
        lg: 'px-8 py-3.5 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
))
Button.displayName = 'Button'

export { Button, buttonVariants }

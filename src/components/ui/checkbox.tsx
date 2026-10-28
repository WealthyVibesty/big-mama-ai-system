import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    type="checkbox"
    ref={ref}
    className={cn('h-5 w-5 shrink-0 rounded border border-input accent-[var(--secondary)]', className)}
    {...props}
  />
))
Checkbox.displayName = 'Checkbox'
export { Checkbox }

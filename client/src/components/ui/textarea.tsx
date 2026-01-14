import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-[#E8E8E8] lg:bg-background px-3 py-2 text-sm lg:text-base ring-offset-background placeholder:text-muted-foreground placeholder:text-sm lg:placeholder:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6030] focus-visible:border-[#FF6030] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }

import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//copy to clipboard util
export const copyToClipboard = (text: string) => {
  toast.success('Copied to clipboard!');
  return navigator.clipboard.writeText(text)
}
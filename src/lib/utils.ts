import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Build full image URL from relative path
 * If path is already a full URL, return as is
 * Otherwise, prepend API base URL
 */
export function buildImageUrl(imagePath: string): string {
  if (!imagePath) return ''
  
  // Check if already a full URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api'
  // Remove /api from the end if present
  const baseUrl = apiBase.replace(/\/api$/, '')
  
  return `${baseUrl}${imagePath}`
}

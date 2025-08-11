'use client'

import { Share2 } from 'lucide-react'
import { useState } from 'react'

interface ShareButtonProps {
  title: string
  description: string
  url: string
}

export function ShareButton({ title, description, url }: ShareButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleShare = async () => {
    const fullUrl = `${window.location.origin}${url}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: fullUrl,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(fullUrl)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy URL:', error)
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      title="Share this post"
    >
      <Share2 className="w-4 h-4" />
      {isCopied ? 'Copied!' : 'Share'}
    </button>
  )
} 
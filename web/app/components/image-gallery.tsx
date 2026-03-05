import { Loader2, X } from 'lucide-react'
import { useFetcher } from 'react-router'

import { Button } from '#app/components/ui/button'

import { ConfirmDialog } from './confirm-dialog'

export function ImageGallery({
  images,
  intentDeleteImage,
}: {
  images: { id: string; url: string }[]
  intentDeleteImage: string
}) {
  const fetcher = useFetcher()

  if (images.length === 0) return null

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((image) => {
        const isDeletingImage =
          fetcher.state !== 'idle' &&
          fetcher.formData?.get('imageId') === image.id
        return (
          <div key={image.id} className="group relative">
            <img
              src={image.url}
              alt=""
              className="h-32 w-full rounded-md border object-cover"
            />
            <ConfirmDialog
              title="画像の削除"
              description="この画像を削除しますか？"
              isLoading={isDeletingImage}
              trigger={(open) => (
                <Button
                  variant="destructive"
                  size="icon-xs"
                  className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100"
                  disabled={isDeletingImage}
                  onClick={open}
                >
                  {isDeletingImage ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </Button>
              )}
              onConfirm={() => {
                const formData = new FormData()
                formData.set('intent', intentDeleteImage)
                formData.set('imageId', image.id)
                fetcher.submit(formData, { method: 'post' })
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

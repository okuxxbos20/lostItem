import { ImagePlus, Loader2 } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'bmp',
  'ico',
  'avif',
  'heic',
  'heif',
])

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return 'ファイルサイズは10MB以下にしてください'
  }
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
    return '許可されていないファイル形式です'
  }
  return null
}

export function ImageDropzone({
  isUploading,
  serverError,
  onUpload,
}: {
  isUploading: boolean
  serverError: string | null
  onUpload: (file: File) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      setClientError(null)
      if (!files || files.length === 0) return

      const file = files[0]
      const error = validateFile(file)
      if (error) {
        setClientError(error)
        return
      }

      onUpload(file)
    },
    [onUpload],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const error = clientError || serverError

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setDragOver(false)
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
      >
        {isUploading ? (
          <Loader2 className="mb-2 h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <ImagePlus className="mb-2 h-8 w-8 text-muted-foreground" />
        )}
        <p className="text-sm text-muted-foreground">
          {isUploading
            ? 'アップロード中...'
            : 'ドラッグ&ドロップ、またはクリックして画像を選択'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          10MB以下の画像ファイル（JPG, PNG, GIF, WebP 等）
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  )
}

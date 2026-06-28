import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '#app/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#app/components/ui/dialog'

export function ConfirmDialog({
  title,
  description,
  confirmLabel = '削除する',
  isLoading = false,
  trigger,
  onConfirm,
}: {
  title: string
  description: string
  confirmLabel?: string
  isLoading?: boolean
  trigger: (open: () => void) => React.ReactNode
  onConfirm: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {trigger(() => setOpen(true))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={() => {
                onConfirm()
                setOpen(false)
              }}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

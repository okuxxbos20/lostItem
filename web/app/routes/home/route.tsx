import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  type SubmissionResult,
  useForm,
} from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod/v4'
import { ImageOff, Loader2, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useFetcher, useNavigation, useSearchParams } from 'react-router'

import { Button } from '#app/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#app/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#app/components/ui/dialog'
import { Input } from '#app/components/ui/input'
import { Label } from '#app/components/ui/label'
import { Textarea } from '#app/components/ui/textarea'

import { createLostItemSchema } from './schema'

import type { Route } from './+types/route'

export { loader } from './loader'
export { action } from './action'

export function meta(_args: Route.MetaArgs) {
  return [
    { title: '落とし物管理システム' },
    { name: 'description', content: '落とし物の一覧' },
  ]
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { items, q } = loaderData
  const navigation = useNavigation()
  const [createKey, setCreateKey] = useState(0)
  const fetcher = useFetcher({ key: `create-${createKey}` })
  const [, setSearchParams] = useSearchParams()
  const [dialogRequested, setDialogRequested] = useState(false)
  const isSearching =
    navigation.state === 'loading' &&
    new URLSearchParams(navigation.location?.search).has('q')

  const isSubmitting = fetcher.state === 'submitting'
  const fetcherData = fetcher.data as
    | { result: SubmissionResult<string[]>; success?: never }
    | { success: boolean; result?: never }
    | undefined

  const dialogOpen = dialogRequested && !fetcherData?.success

  const [form, fields] = useForm({
    lastResult: fetcherData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createLostItemSchema })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">落とし物一覧</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="名前で検索..."
              defaultValue={q}
              className="w-56 pl-9"
              onChange={(e) => {
                const value = e.target.value
                if (value) {
                  setSearchParams({ q: value })
                } else {
                  setSearchParams({})
                }
              }}
            />
            {isSearching && (
              <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              if (!open) setDialogRequested(false)
            }}
          >
            <Button
              onClick={() => {
                setDialogRequested(true)
                setCreateKey((k) => k + 1)
              }}
            >
              <Plus className="h-4 w-4" />
              新規作成
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>落とし物を登録</DialogTitle>
              </DialogHeader>
              <fetcher.Form
                method="post"
                {...getFormProps(form)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor={fields.name.id}>
                    名前 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    {...getInputProps(fields.name, { type: 'text' })}
                    placeholder="例: 黒い財布"
                  />
                  {fields.name.errors && (
                    <p className="text-sm text-destructive">
                      {fields.name.errors[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={fields.description.id}>説明</Label>
                  <Textarea
                    {...getTextareaProps(fields.description)}
                    placeholder="例: 2階のトイレ付近で発見"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogRequested(false)}
                  >
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    登録
                  </Button>
                </DialogFooter>
              </fetcher.Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {navigation.state === 'loading' ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          {q
            ? `「${q}」に一致する落とし物はありません`
            : '落とし物はまだ登録されていません'}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <Link key={item.id} to={`/lost-items/${item.id}`} className="block">
              <Card className="flex-row items-center py-3 transition-shadow hover:shadow-md">
                <div className="shrink-0 pl-3">
                  {item.images[0] ? (
                    <img
                      src={item.images[0].url}
                      alt=""
                      className="h-10 w-10 rounded-md border object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                      <ImageOff className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardHeader className="flex-1 gap-0 py-0">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  {item.description && (
                    <CardDescription className="line-clamp-1">
                      {item.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <div className="pr-6 text-sm text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString('ja-JP')}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

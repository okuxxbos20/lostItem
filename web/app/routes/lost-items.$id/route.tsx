import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  type SubmissionResult,
  useForm,
} from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod/v4'
import { ArrowLeft, Check, Loader2, Pencil, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Form, Link, useFetcher, useNavigation } from 'react-router'

import { ConfirmDialog } from '#app/components/confirm-dialog'
import { ImageDropzone } from '#app/components/image-dropzone'
import { ImageGallery } from '#app/components/image-gallery'
import { Button } from '#app/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#app/components/ui/card'
import { Input } from '#app/components/ui/input'
import { Label } from '#app/components/ui/label'
import { Textarea } from '#app/components/ui/textarea'

import { INTENT } from './intent'
import { updateLostItemSchema } from './schema'

import type { Route } from './+types/route'

export { loader } from './loader'
export { action } from './action'

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data ? `${data.item.name} - 落とし物管理` : '落とし物管理' }]
}

export default function LostItemDetail({ loaderData }: Route.ComponentProps) {
  const { item } = loaderData
  const navigation = useNavigation()
  const uploadFetcher = useFetcher()
  const updateFetcher = useFetcher()
  const [editing, setEditing] = useState(false)

  const isDeleting =
    navigation.state === 'submitting' &&
    navigation.formData?.get('intent') === INTENT.DELETE
  const isUpdating = updateFetcher.state === 'submitting'

  const updateData = updateFetcher.data as
    | { result: SubmissionResult<string[]>; success?: never }
    | { success: boolean; result?: never }
    | undefined

  // Close edit mode on success
  const editOpen = editing && !updateData?.success

  const [form, fields] = useForm({
    defaultValue: {
      name: item.name,
      description: item.description ?? '',
    },
    lastResult: updateData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updateLostItemSchema })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  const serverError =
    uploadFetcher.data && 'error' in uploadFetcher.data
      ? (uploadFetcher.data as { error: string }).error
      : null

  return (
    <div>
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        一覧に戻る
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            {editOpen ? (
              <div className="flex-1" />
            ) : (
              <CardTitle className="text-xl">{item.name}</CardTitle>
            )}
            <div className="flex gap-2">
              {!editOpen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(true)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  編集
                </Button>
              )}
              <ConfirmDialog
                title="削除の確認"
                description={`「${item.name}」を削除しますか？この操作は取り消せません。`}
                isLoading={isDeleting}
                trigger={(open) => (
                  <Button variant="destructive" size="sm" onClick={open}>
                    <Trash2 className="h-4 w-4" />
                    削除
                  </Button>
                )}
                onConfirm={() => {
                  const deleteForm = document.getElementById(
                    'delete-item-form',
                  ) as HTMLFormElement
                  deleteForm?.requestSubmit()
                }}
              />
              <Form method="post" id="delete-item-form" className="hidden">
                <input type="hidden" name="intent" value={INTENT.DELETE} />
              </Form>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {editOpen ? (
            <updateFetcher.Form
              method="post"
              {...getFormProps(form)}
              className="space-y-4"
            >
              <input type="hidden" name="intent" value={INTENT.UPDATE} />
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
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isUpdating}>
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  保存
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(false)}
                >
                  <X className="h-4 w-4" />
                  キャンセル
                </Button>
              </div>
            </updateFetcher.Form>
          ) : (
            <>
              {item.description && (
                <div>
                  <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                    説明
                  </h3>
                  <p className="whitespace-pre-wrap">{item.description}</p>
                </div>
              )}
            </>
          )}
          <div>
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">
              登録日
            </h3>
            <p>{new Date(item.createdAt).toLocaleString('ja-JP')}</p>
          </div>
          <div>
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">
              更新日
            </h3>
            <p>{new Date(item.updatedAt).toLocaleString('ja-JP')}</p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              画像
            </h3>
            <ImageGallery
              images={item.images}
              intentDeleteImage={INTENT.DELETE_IMAGE}
            />
            <ImageDropzone
              isUploading={uploadFetcher.state !== 'idle'}
              serverError={serverError}
              onUpload={(file) => {
                const formData = new FormData()
                formData.set('intent', INTENT.UPLOAD_IMAGE)
                formData.set('file', file)
                uploadFetcher.submit(formData, {
                  method: 'post',
                  encType: 'multipart/form-data',
                })
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { fetchProtectedDocObjectUrl } from '@/lib/uploads/protected-docs'
import { cn } from '@/lib/utils'

type ProtectedDocImageProps = {
  path: string
  label: string
  className?: string
}

export function ProtectedDocImage({ path, label, className }: ProtectedDocImageProps) {
  const { t } = useTranslation()
  const [src, setSrc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    let objectUrl: string | null = null

    setLoading(true)
    setError(null)
    setSrc(null)

    void fetchProtectedDocObjectUrl(path)
      .then((url) => {
        if (!active) {
          URL.revokeObjectURL(url)
          return
        }
        objectUrl = url
        setSrc(url)
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setError(t('uploads.docLoadFailed'))
        setLoading(false)
      })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [path, t])

  return (
    <figure className={cn('space-y-1', className)}>
      <figcaption className="text-xs font-medium text-muted-foreground">{label}</figcaption>
      {loading ? <p className="text-xs text-muted-foreground">{t('common.loading')}</p> : null}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {src ? (
        <div className="aspect-[4/3] overflow-hidden rounded-md border border-input bg-muted">
          <img src={src} alt={label} className="h-full w-full object-cover" />
        </div>
      ) : null}
    </figure>
  )
}

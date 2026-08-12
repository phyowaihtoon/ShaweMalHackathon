type PlaceholderPageProps = {
  title: string
  description?: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {description ? <p className="mt-2 text-muted-foreground">{description}</p> : null}
    </section>
  )
}

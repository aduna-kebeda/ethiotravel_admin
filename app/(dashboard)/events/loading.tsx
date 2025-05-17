export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted"></div>
          <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-muted"></div>
        </div>
        <div className="h-10 w-32 animate-pulse rounded-md bg-muted"></div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted"></div>
        <div className="h-10 w-full sm:w-[180px] animate-pulse rounded-md bg-muted"></div>
        <div className="h-10 w-full sm:w-[180px] animate-pulse rounded-md bg-muted"></div>
      </div>

      <div className="rounded-md border">
        <div className="h-12 w-full animate-pulse rounded-t-md bg-muted"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 w-full animate-pulse border-t bg-muted/30"></div>
        ))}
      </div>
    </div>
  )
}

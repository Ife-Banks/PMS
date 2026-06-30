import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function DashboardLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}
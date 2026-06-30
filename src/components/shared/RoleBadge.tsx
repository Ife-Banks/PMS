import { Badge } from '@/components/ui/badge'
import type { Role } from '@/lib/types'

interface RoleBadgeProps {
  role: Role
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <Badge
      variant={role === 'admin' ? 'default' : 'secondary'}
      className={role === 'admin' 
        ? 'bg-gradient-to-br from-green-500/20 to-green-500/10 text-green-700 border-green-500/30 hover:from-green-500/30 hover:to-green-500/15 font-semibold text-[10px] uppercase tracking-wider' 
        : 'bg-gradient-to-br from-blue-500/15 to-blue-500/5 text-blue-600 border-blue-500/25 font-semibold text-[10px] uppercase tracking-wider'
      }
    >
      {role === 'admin' ? 'Admin' : 'Farm Worker'}
    </Badge>
  )
}
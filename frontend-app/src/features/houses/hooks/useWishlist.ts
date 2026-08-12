import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useAuth } from '@/app/providers/AuthProvider'

import { wishlistApi } from '../api/wishlist-api'

export function useWishlist() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const wishlistQuery = useQuery({
    queryKey: ['wishlist'],
    enabled: isAuthenticated,
    queryFn: () => wishlistApi.list(),
  })

  const wishlistedIds = useMemo(() => {
    const ids = new Set<string>()
    for (const item of wishlistQuery.data?.items ?? []) {
      ids.add(item.houseId)
    }
    return ids
  }, [wishlistQuery.data?.items])

  const addMutation = useMutation({
    mutationFn: (houseId: string) => wishlistApi.add(houseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (houseId: string) => wishlistApi.remove(houseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })

  return {
    wishlistedIds,
    isLoading: wishlistQuery.isLoading,
    isError: wishlistQuery.isError,
    add: addMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    isToggling: addMutation.isPending || removeMutation.isPending,
  }
}

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export function useFiles() {
  const query = useInfiniteQuery({
    queryKey: ['files'],
    queryFn: async ({ pageParam }) => {
      const res = await apiClient.get('/api/files', { params: pageParam ? { pageToken: pageParam } : {} });
      return res.data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,
  });

  const files = query.data ? query.data.pages.flatMap((page) => page.files) : [];
  return { ...query, files };
}

export function useFile(fileId) {
  return useQuery({
    queryKey: ['files', fileId],
    queryFn: async () => (await apiClient.get(`/api/files/${fileId}`)).data.file,
    enabled: !!fileId,
  });
}

export function useFileContent(fileId, enabled) {
  return useQuery({
    queryKey: ['files', fileId, 'content'],
    queryFn: async () =>
      (await apiClient.get(`/api/files/${fileId}/content`, { responseType: 'blob' })).data,
    enabled: !!fileId && enabled,
    staleTime: Infinity,
    retry: false,
  });
}

export function useLists() {
  const query = useQuery({
    queryKey: ['lists'],
    queryFn: async () => (await apiClient.get('/api/lists')).data.lists,
  });
  return { ...query, lists: query.data || [] };
}

export function useListDetail(listId) {
  const query = useQuery({
    queryKey: ['lists', listId],
    queryFn: async () => (await apiClient.get(`/api/lists/${listId}`)).data.items,
    enabled: !!listId,
  });
  return { ...query, items: query.data || [] };
}

export function useTags() {
  const query = useQuery({
    queryKey: ['tags'],
    queryFn: async () => (await apiClient.get('/api/tags')).data.tags,
  });
  return { ...query, tags: query.data || [] };
}

export function useTagItems(tagId) {
  const query = useQuery({
    queryKey: ['items', tagId],
    queryFn: async () => (await apiClient.get('/api/items', { params: { tag: tagId } })).data.items,
    enabled: !!tagId,
  });
  return { ...query, items: query.data || [] };
}

export function useCreateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name) => apiClient.post('/api/lists', { name }).then((res) => res.data.list),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId) => apiClient.delete(`/api/lists/${listId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  });
}

export function useAddToList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, file }) =>
      apiClient.post(`/api/lists/${listId}/items`, { driveFileId: file.id, fileName: file.name }),
    onSuccess: (_data, { listId }) => queryClient.invalidateQueries({ queryKey: ['lists', listId] }),
  });
}

export function useRemoveFromList(listId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => apiClient.delete(`/api/lists/${listId}/items/${itemId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists', listId] }),
  });
}

export function useListMembers(listId) {
  const query = useQuery({
    queryKey: ['lists', listId, 'members'],
    queryFn: async () => (await apiClient.get(`/api/lists/${listId}/members`)).data.members,
    enabled: !!listId,
  });
  return { ...query, members: query.data || [] };
}

export function useAddMember(listId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role }) =>
      apiClient.post(`/api/lists/${listId}/members`, { email, role }).then((res) => res.data.member),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', listId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}

export function useRemoveMember(listId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => apiClient.delete(`/api/lists/${listId}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', listId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, color }) =>
      apiClient.post('/api/tags', { name, color }).then((res) => res.data.tag),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
  });
}

export function useUpdateTagColor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tagId, color }) =>
      apiClient.put(`/api/tags/${tagId}`, { color }).then((res) => res.data.tag),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
  });
}

export function useAttachTag(listId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, tag }) =>
      apiClient.post(`/api/lists/${listId}/items/${itemId}/tags`, { tagId: tag.id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists', listId] }),
  });
}

export function useDetachTag(listId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, tagId }) =>
      apiClient.delete(`/api/lists/${listId}/items/${itemId}/tags/${tagId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists', listId] }),
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invitationsApi } from "@/api/invitations.api";

export function useInvitations(params?: {
  templateId?: string;
  search?: string;
  tenantId?: string;
}) {
  return useQuery({
    queryKey: ["invitations", params],
    queryFn: () => invitationsApi.list(params),
  });
}

export function useInvitation(id: string) {
  return useQuery({
    queryKey: ["invitation", id],
    queryFn: () => invitationsApi.get(id),
    enabled: !!id,
  });
}

export function useInvitationBySlug(slug: string, token?: string) {
  return useQuery({
    queryKey: ["invitation-public", slug, token],
    queryFn: () => invitationsApi.getBySlug(slug, token),
    enabled: !!slug,
  });
}

export function useFillInvitationVariables() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      variables,
    }: {
      id: string;
      variables: Array<{
        key: string;
        valueText?: string;
        valueJson?: Record<string, unknown>;
      }>;
    }) => invitationsApi.fillVariables(id, { variables }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invitation", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}

export function usePublishInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, slug }: { id: string; slug?: string }) =>
      invitationsApi.publish(id, { slug }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invitation", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}

export function useUnpublishInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => invitationsApi.unpublish(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invitation", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}

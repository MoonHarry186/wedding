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

export function useCreateAdminInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      mode: "blank" | "from_template";
      templateId?: string;
    }) => invitationsApi.createAdmin(payload),
    onSuccess: (invitation) => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["invitation", invitation.id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateInvitationCanvas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      canvasData,
    }: {
      id: string;
      canvasData: Record<string, unknown>;
    }) => invitationsApi.updateCanvas(id, { canvasData }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invitation", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}

export function useUpdateInvitationMeta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, slug }: { id: string; slug?: string }) =>
      invitationsApi.updateMeta(id, { slug }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invitation", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
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

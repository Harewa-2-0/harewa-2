// src/hooks/useFashionChat.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sendFashionConsultation, getChatHistory, type ChatMessage, type SendMessageResponse, type FashionChatInput } from '@/services/fashionChat';

/** ---------- Query Keys ---------- */
export const fashionChatKeys = {
    all: ['fashionChat'] as const,
    history: () => [...fashionChatKeys.all, 'history'] as const,
};

/** ---------- Hooks ---------- */

/**
 * Hook to fetch chat history
 */
export function useChatHistoryQuery() {
    return useQuery({
        queryKey: fashionChatKeys.history(),
        queryFn: getChatHistory,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    });
}

/**
 * Hook to send a fashion consultation request
 */
export function useSendConsultationMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: FashionChatInput) => sendFashionConsultation(input),
        onMutate: async (input: FashionChatInput) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: fashionChatKeys.history() });

            // Snapshot previous value
            const previousHistory = queryClient.getQueryData<ChatMessage[]>(fashionChatKeys.history());

            const optimisticUserMessage: ChatMessage = {
                role: 'user',
                content: input.messages && input.messages.length > 0
                    ? input.messages[input.messages.length - 1].content
                    : "Fashion consultation request",
                timestamp: new Date().toISOString(),
            };

            queryClient.setQueryData<ChatMessage[]>(
                fashionChatKeys.history(),
                (old = []) => [...old, optimisticUserMessage]
            );

            return { previousHistory };
        },
        onSuccess: (data: SendMessageResponse) => {
            // Update cache with actual server response
            queryClient.setQueryData<ChatMessage[]>(
                fashionChatKeys.history(),
                () => {
                    // Use the newly returned complete message array if available, otherwise fallback
                    if (data.chat && Array.isArray(data.chat.messages)) {
                        return data.chat.messages;
                    }
                    return [];
                }
            );
        },
        onError: (error, input, context) => {
            // Rollback on error
            if (context?.previousHistory) {
                queryClient.setQueryData(fashionChatKeys.history(), context.previousHistory);
            }
            console.error('Failed to send consultation:', error);
        },
    });
}

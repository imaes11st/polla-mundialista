import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseService } from '../services/supabase';

export function usePredictions(participantId: string, tournamentId: string) {
  const queryClient = useQueryClient();

  // 1. La Query que lee las predicciones de la Base de Datos
  const query = useQuery({
    // IMPORTANTE: La llave debe incluir tanto el participante como el torneo
    queryKey: ['predictions', participantId, tournamentId],
    queryFn: async () => {
      if (!participantId || !tournamentId) return [];
      const { data, error } = await supabaseService.getPredictions(participantId, tournamentId);
      if (error) throw error;
      
      // Mapeamos para aplanar los puntos si existen
      return (data || []).map((p: any) => ({
        ...p,
        points_awarded: p.points 
          ? (Array.isArray(p.points) ? p.points[0]?.points_awarded : p.points?.points_awarded)
          : 0
      }));
    },
    enabled: !!participantId && !!tournamentId, // No se ejecuta si faltan IDs
  });

  // 2. La Mutación que guarda o actualiza (UPSERT)
  const save = useMutation({
    mutationFn: async (predictionData: {
      participant_id: string;
      match_id: string;
      predicted_home: number;
      predicted_away: number;
    }) => {
      const { data, error } = await supabaseService.savePrediction(predictionData);
      if (error) throw error;
      return data;
    },
    // AQUÍ ESTÁ EL TRUCO PARA QUE SE PINTE AL INSTANTE
    onSuccess: () => {
      // Le decimos a React Query que limpie la caché e invoque un GET fresco de las predicciones y partidos
      queryClient.invalidateQueries({
        queryKey: ['predictions', participantId, tournamentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['matches', tournamentId, participantId],
      });
    },
  });

  return {
    ...query,
    save,
  };
}
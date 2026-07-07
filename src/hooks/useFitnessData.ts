import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  profileService,
  weightService,
  trainingService,
  measurementService,
  photoService,
  goalService,
  healthService,
} from '@/services/api';
import { Training } from '@/types/database.types';

export function useFitnessData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id || '';

  // =========================================================================
  // QUERIES
  // =========================================================================
  const useProfile = () =>
    useQuery({
      queryKey: ['profile', userId],
      queryFn: () => profileService.get(userId),
      enabled: !!userId,
    });

  const useWeights = () =>
    useQuery({
      queryKey: ['weights', userId],
      queryFn: () => weightService.getAll(userId),
      enabled: !!userId,
    });

  const useTrainings = () =>
    useQuery({
      queryKey: ['trainings', userId],
      queryFn: () => trainingService.getAll(userId),
      enabled: !!userId,
    });

  const useMeasurements = () =>
    useQuery({
      queryKey: ['measurements', userId],
      queryFn: () => measurementService.getAll(userId),
      enabled: !!userId,
    });

  const usePhotos = () =>
    useQuery({
      queryKey: ['photos', userId],
      queryFn: () => photoService.getAll(userId),
      enabled: !!userId,
    });

  const useGoals = () =>
    useQuery({
      queryKey: ['goals', userId],
      queryFn: () => goalService.getAll(userId),
      enabled: !!userId,
    });

  const useHealth = () =>
    useQuery({
      queryKey: ['health', userId],
      queryFn: () => healthService.getAll(userId),
      enabled: !!userId,
    });

  // =========================================================================
  // MUTATIONS (MUTACÕES COM INVALIDAÇÃO AUTOMÁTICA DE CACHE)
  // =========================================================================
  
  // Perfil
  const updateProfileMutation = useMutation({
    mutationFn: (updates: Parameters<typeof profileService.update>[1]) =>
      profileService.update(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });

  // Pesos
  const upsertWeightMutation = useMutation({
    mutationFn: (variables: { date: string; weight: number; notes?: string | null }) =>
      weightService.upsert(userId, variables.date, variables.weight, variables.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weights', userId] });
    },
  });

  const deleteWeightMutation = useMutation({
    mutationFn: (id: string) => weightService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weights', userId] });
    },
  });

  // Treinos
  const createTrainingMutation = useMutation({
    mutationFn: (training: Omit<Training, 'id' | 'user_id' | 'created_at'>) =>
      trainingService.create(userId, training),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings', userId] });
    },
  });

  const deleteTrainingMutation = useMutation({
    mutationFn: (id: string) => trainingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings', userId] });
    },
  });

  // Medidas
  const upsertMeasurementMutation = useMutation({
    mutationFn: (variables: {
      date: string;
      measurements: Parameters<typeof measurementService.upsert>[2];
    }) => measurementService.upsert(userId, variables.date, variables.measurements),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements', userId] });
    },
  });

  const deleteMeasurementMutation = useMutation({
    mutationFn: (id: string) => measurementService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements', userId] });
    },
  });

  // Fotos
  const createPhotoMutation = useMutation({
    mutationFn: (photo: Parameters<typeof photoService.create>[1]) =>
      photoService.create(userId, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', userId] });
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: (id: string) => photoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', userId] });
    },
  });

  // Metas
  const createGoalMutation = useMutation({
    mutationFn: (targetWeight: number) => goalService.create(userId, targetWeight),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: (variables: { id: string; updates: Parameters<typeof goalService.update>[1] }) =>
      goalService.update(variables.id, variables.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => goalService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
    },
  });

  // Saúde e Sono
  const upsertHealthMutation = useMutation({
    mutationFn: (variables: {
      date: string;
      health: Parameters<typeof healthService.upsert>[2];
    }) => healthService.upsert(userId, variables.date, variables.health),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health', userId] });
    },
  });

  const deleteHealthMutation = useMutation({
    mutationFn: (id: string) => healthService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health', userId] });
    },
  });

  return {
    useProfile,
    useWeights,
    useTrainings,
    useMeasurements,
    usePhotos,
    useGoals,
    useHealth,
    
    // Mutations exports
    updateProfile: updateProfileMutation.mutateAsync,
    upsertWeight: upsertWeightMutation.mutateAsync,
    deleteWeight: deleteWeightMutation.mutateAsync,
    createTraining: createTrainingMutation.mutateAsync,
    deleteTraining: deleteTrainingMutation.mutateAsync,
    upsertMeasurement: upsertMeasurementMutation.mutateAsync,
    deleteMeasurement: deleteMeasurementMutation.mutateAsync,
    createPhoto: createPhotoMutation.mutateAsync,
    deletePhoto: deletePhotoMutation.mutateAsync,
    createGoal: createGoalMutation.mutateAsync,
    updateGoal: updateGoalMutation.mutateAsync,
    deleteGoal: deleteGoalMutation.mutateAsync,
    upsertHealth: upsertHealthMutation.mutateAsync,
    deleteHealth: deleteHealthMutation.mutateAsync,
  };
}

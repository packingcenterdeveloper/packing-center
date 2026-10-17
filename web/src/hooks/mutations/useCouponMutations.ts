import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminCreateAssignment,
  adminCreateCoupon,
  adminDeleteAssignment,
  adminDeleteCoupon,
  adminUpdateCoupon,
  type CreateAssignmentInput,
  type CreateCouponInput,
  type UpdateCouponInput,
} from '@/api/admin/coupons';
import { adminCouponsKeys } from '../queries/useAdminCoupons';

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: adminCouponsKeys.all });
  };
}

export function useCreateCoupon() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: CreateCouponInput) => adminCreateCoupon(input),
    onSuccess: invalidate,
  });
}

export function useUpdateCoupon(id: number) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: UpdateCouponInput) => adminUpdateCoupon(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteCoupon() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => adminDeleteCoupon(id),
    onSuccess: invalidate,
  });
}

export function useCreateAssignment(couponId: number) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: CreateAssignmentInput) =>
      adminCreateAssignment(couponId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteAssignment(couponId: number) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (assignmentId: number) =>
      adminDeleteAssignment(couponId, assignmentId),
    onSuccess: invalidate,
  });
}
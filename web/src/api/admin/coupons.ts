import { api } from '../client';
import type {
  ApiResponse,
  Coupon,
  CouponAssignment,
} from '../types';

export async function adminListCoupons(
  includeInactive = true,
): Promise<Coupon[]> {
  const { data } = await api.get<ApiResponse<Coupon[]>>('/api/v1/coupons', {
    params: includeInactive ? { includeInactive: 'true' } : undefined,
  });
  return data.data;
}

export async function adminGetCoupon(id: number): Promise<Coupon> {
  const { data } = await api.get<ApiResponse<Coupon>>(
    `/api/v1/coupons/${id}`,
  );
  return data.data;
}

export interface CreateCouponInput {
  code: string;
  description?: string;
  maxUses?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive?: boolean;
}

export type UpdateCouponInput = Omit<CreateCouponInput, 'code'>;

export async function adminCreateCoupon(
  input: CreateCouponInput,
): Promise<Coupon> {
  const { data } = await api.post<ApiResponse<Coupon>>(
    '/api/v1/coupons',
    input,
  );
  return data.data;
}

export async function adminUpdateCoupon(
  id: number,
  input: UpdateCouponInput,
): Promise<Coupon> {
  const { data } = await api.patch<ApiResponse<Coupon>>(
    `/api/v1/coupons/${id}`,
    input,
  );
  return data.data;
}

export async function adminDeleteCoupon(id: number): Promise<void> {
  await api.delete(`/api/v1/coupons/${id}`);
}

export interface CreateAssignmentInput {
  productId: number;
  presentationId: number;
  percent: number;
  isActive?: boolean;
}

export async function adminCreateAssignment(
  couponId: number,
  input: CreateAssignmentInput,
): Promise<CouponAssignment> {
  const { data } = await api.post<ApiResponse<CouponAssignment>>(
    `/api/v1/coupons/${couponId}/assignments`,
    input,
  );
  return data.data;
}

export async function adminDeleteAssignment(
  couponId: number,
  assignmentId: number,
): Promise<void> {
  await api.delete(`/api/v1/coupons/${couponId}/assignments/${assignmentId}`);
}
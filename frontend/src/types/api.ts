/* ─── API Response Types ────────────────────────────────────────────────── */

export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
}

export interface ApiTenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: ApiUser;
  tenant: ApiTenant;
  role: Role;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

/* ─── Tenant ─────────────────────────────────────────────────────────────── */

export interface ApiMember {
  id: string;
  userId: string;
  role: Role;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
}

export interface ApiStorefront {
  id: string;
  tenantId: string;
  bannerUrl: string | null;
  welcomeText: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  themeColor: string | null;
  socialLinks: Record<string, string> | null;
  isActive: boolean;
  customDomain: string | null;
  domainVerified: boolean;
  domainVerificationToken: string | null;
}

/* ─── Subscription ───────────────────────────────────────────────────────── */

export interface ApiSubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxTemplates: number | null;
  maxMembers: number | null;
  customDomain: boolean;
  analytics: boolean;
  marketplaceListing: boolean;
  aiBYOK: boolean;
  isActive: boolean;
}

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

export interface ApiSubscription {
  id: string;
  tenantId: string;
  planId: string;
  plan: ApiSubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  provider: string;
}

/* ─── Templates ──────────────────────────────────────────────────────────── */

export type TemplateStatus = 'private' | 'published';

export interface ApiTemplateCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  iconUrl: string | null;
  children?: ApiTemplateCategory[];
}

export interface ApiTemplate {
  id: string;
  tenantId: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  category: ApiTemplateCategory | null;
  price: number;
  currency: string;
  thumbnailUrl: string | null;
  status: TemplateStatus;
  canvasData: CanvasData; 
  variables: Record<string, unknown>[];
  isMarketplace: boolean;
  viewCount: number;
  purchaseCount: number;
  createdAt: string;
  updatedAt: string;
}

/* ─── Orders & Invitations ────────────────────────────────────────────────── */

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type PaymentProvider = 'vnpay' | 'momo' | 'stripe';

export interface ApiPayment {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  providerTxnId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApiOrderItem {
  id: string;
  orderId: string;
  templateId: string;
  templateTitle: string;
  unitPrice: number;
}

export interface ApiOrder {
  id: string;
  tenantId: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  subtotal: number;
  platformFee: number;
  tenantRevenue: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
  items: ApiOrderItem[];
  payment: ApiPayment;
}

export interface ApiCustomer {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface ApiTemplateVariableDefinition {
  id?: string;
  key: string;
  label: string;
  type:
    | "text"
    | "date"
    | "datetime"
    | "image"
    | "number"
    | "color"
    | "url"
    | "address"
    | "json";
  required: boolean;
  defaultValue: string | null;
  placeholder: string | null;
  sortOrder: number;
}

export interface ApiInvitation {
  id: string;
  orderId: string;
  orderItemId: string;
  templateId: string;
  templateInstanceId: string | null;
  templateTitle: string | null;
  customerName: string | null;
  customerEmail: string;
  accessToken: string;
  slug: string | null;
  isPublic: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  canvasData: CanvasData | null;
  variableDefinitions: ApiTemplateVariableDefinition[];
  variableValues: Record<string, string | number | boolean | Record<string, unknown>>;
}
import type { CanvasData } from "./editor";

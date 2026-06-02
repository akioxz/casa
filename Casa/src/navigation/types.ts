import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword?: { email?: string };
};

export type UserTabParamList = {
  HomeTab: undefined;
  CatalogTab: undefined;
  CartTab: undefined;
  ProfileTab: undefined;
};

export type UserStackParamList = {
  MainTabs: NavigatorScreenParams<UserTabParamList>;
  ProductDetails: { productId: string };
  ImagePlacement: { productId?: string; imageUrl?: string };
  Checkout: undefined;
  OrderHistory: undefined;
};

export type AdminStackParamList = {
  Dashboard: undefined;
  ManageProducts: undefined;
  ManageOrders: undefined;
  EditProduct: { productId?: string }; // undefined for create, id for edit
  AuditLogs: undefined;
  AdminProfile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  User: NavigatorScreenParams<UserStackParamList>;
  Admin: NavigatorScreenParams<AdminStackParamList>;
  Loading: undefined;
};

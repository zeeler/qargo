import { UserRole } from '../constants/enums';

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  avatar: string;
  defaultAddress: string;
  createdAt: string;
}

export interface UserAddress {
  id: string;
  label: string;
  address: string;
  lng: number;
  lat: number;
  contactName: string;
  contactPhone: string;
  isDefault: boolean;
}

export interface UpdateProfileDto {
  name?: string;
  avatar?: string;
  defaultAddress?: string;
}

export interface CreateAddressDto {
  label: string;
  address: string;
  lng: number;
  lat: number;
  contactName: string;
  contactPhone: string;
  isDefault?: boolean;
}

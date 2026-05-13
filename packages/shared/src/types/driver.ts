import { DriverStatus } from '../constants/enums';

export interface DriverRegisterDto {
  realName: string;
  idCard: string;
  licenseInfo: string;
  vehicle: {
    brand: string;
    model: string;
    color: string;
    plateNumber: string;
    vehicleTypeCode: string;
    length: number;
    width: number;
    height: number;
    vin: string;
  };
}

export interface DriverVo {
  id: string;
  userId: string;
  realName: string;
  status: DriverStatus;
  vehicle: {
    brand: string;
    model: string;
    color: string;
    plateNumber: string;
    vehicleTypeName: string;
  };
}

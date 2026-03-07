import { Prisma } from '@prisma/client';

export interface DeviceInfo extends Prisma.JsonObject {
  deviceId: string;
  deviceType?: string;
  os?: string;
  browser?: string;
}

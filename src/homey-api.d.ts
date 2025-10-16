declare module 'homey-api' {
  export class HomeyAPI {
    static createLocalAPI(options: {
      address: string;
      token: string;
      debug?: null;
    }): Promise<HomeyAPI>;

    devices: {
      getDevices(): Promise<Record<string, Device>>;
      getDevice(params: { id: string }): Promise<Device>;
    };

    zones: {
      getZones(): Promise<Record<string, Zone>>;
    };

    flow: {
      getFlows(): Promise<Record<string, Flow>>;
      getFlow(params: { id: string }): Promise<Flow>;
    };
  }

  export interface Device {
    id: string;
    name: string;
    zone?: { name: string };
    class: string;
    available: boolean;
    capabilities: string[];
    capabilitiesObj?: Record<string, unknown>;
    setCapabilityValue(params: { capabilityId: string; value: unknown }): Promise<void>;
  }

  export interface Zone {
    id: string;
    name: string;
    parent?: { name: string };
  }

  export interface Flow {
    id: string;
    name: string;
    enabled: boolean;
    trigger(): Promise<void>;
  }
}

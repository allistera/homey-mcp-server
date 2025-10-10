#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { HomeyAPI } from 'homey-api';

const HOMEY_API_TOKEN = process.env.HOMEY_API_TOKEN || '';
const HOMEY_LOCAL_IP = process.env.HOMEY_LOCAL_IP || '';

class HomeyMCPServer {
  private server: Server;
  private homeyApi: unknown | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-server-homey',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private async connectToHomey(): Promise<void> {
    if (this.homeyApi) return;

    if (!HOMEY_API_TOKEN || !HOMEY_LOCAL_IP) {
      throw new Error(
        'HOMEY_API_TOKEN and HOMEY_LOCAL_IP environment variables must be set'
      );
    }

    this.homeyApi = await HomeyAPI.createLocalAPI({
      address: `http://${HOMEY_LOCAL_IP}`,
      token: HOMEY_API_TOKEN,
      debug: null,
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'list_devices',
          description: 'List all devices connected to Homey',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_device',
          description: 'Get details about a specific device',
          inputSchema: {
            type: 'object',
            properties: {
              deviceId: {
                type: 'string',
                description: 'The ID of the device',
              },
            },
            required: ['deviceId'],
          },
        },
        {
          name: 'set_capability',
          description: 'Set a capability value for a device (e.g., turn on/off, set brightness)',
          inputSchema: {
            type: 'object',
            properties: {
              deviceId: {
                type: 'string',
                description: 'The ID of the device',
              },
              capability: {
                type: 'string',
                description: 'The capability to set (e.g., onoff, dim, target_temperature)',
              },
              value: {
                description: 'The value to set (boolean, number, or string depending on capability)',
              },
            },
            required: ['deviceId', 'capability', 'value'],
          },
        },
        {
          name: 'list_zones',
          description: 'List all zones in Homey',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'trigger_flow',
          description: 'Trigger a Homey Flow',
          inputSchema: {
            type: 'object',
            properties: {
              flowId: {
                type: 'string',
                description: 'The ID of the flow to trigger',
              },
            },
            required: ['flowId'],
          },
        },
        {
          name: 'list_flows',
          description: 'List all flows in Homey',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ];

      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        await this.connectToHomey();

        if (!this.homeyApi) {
          throw new Error('Failed to connect to Homey API');
        }

        switch (request.params.name) {
          case 'list_devices': {
            const devices = await this.homeyApi.devices.getDevices();
            const deviceList = Object.values(devices).map((device: unknown) => {
              const dev = device as { id: string; name: string; zone?: { name: string }; class: string; available: boolean; capabilities: string[] };
              return {
                id: dev.id,
                name: dev.name,
                zone: dev.zone?.name,
                class: dev.class,
                available: dev.available,
                capabilities: dev.capabilities,
              };
            });

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(deviceList, null, 2),
                },
              ],
            };
          }

          case 'get_device': {
            const { deviceId } = request.params.arguments as { deviceId: string };
            const device = await this.homeyApi.devices.getDevice({ id: deviceId });

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      id: device.id,
                      name: device.name,
                      zone: device.zone?.name,
                      class: device.class,
                      available: device.available,
                      capabilities: device.capabilities,
                      capabilitiesObj: device.capabilitiesObj,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'set_capability': {
            const { deviceId, capability, value } = request.params.arguments as {
              deviceId: string;
              capability: string;
              value: unknown;
            };

            const device = await this.homeyApi.devices.getDevice({ id: deviceId });
            await device.setCapabilityValue({ capabilityId: capability, value });

            return {
              content: [
                {
                  type: 'text',
                  text: `Successfully set ${capability} to ${value} for device ${device.name}`,
                },
              ],
            };
          }

          case 'list_zones': {
            const zones = await this.homeyApi.zones.getZones();
            const zoneList = Object.values(zones).map((zone: unknown) => {
              const z = zone as { id: string; name: string; parent?: { name: string } };
              return {
                id: z.id,
                name: z.name,
                parent: z.parent?.name,
              };
            });

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(zoneList, null, 2),
                },
              ],
            };
          }

          case 'list_flows': {
            const flows = await this.homeyApi.flow.getFlows();
            const flowList = Object.values(flows).map((flow: unknown) => {
              const f = flow as { id: string; name: string; enabled: boolean };
              return {
                id: f.id,
                name: f.name,
                enabled: f.enabled,
              };
            });

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(flowList, null, 2),
                },
              ],
            };
          }

          case 'trigger_flow': {
            const { flowId } = request.params.arguments as { flowId: string };
            const flow = await this.homeyApi.flow.getFlow({ id: flowId });
            await flow.trigger();

            return {
              content: [
                {
                  type: 'text',
                  text: `Successfully triggered flow: ${flow.name}`,
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Homey MCP server running on stdio');
  }
}

const server = new HomeyMCPServer();
server.run().catch(console.error);

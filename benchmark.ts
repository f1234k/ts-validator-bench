import { performance } from 'perf_hooks';
import * as mqtt from 'mqtt';
import * as v from 'valibot';
import { z } from 'zod';
import { type, ArkErrors } from 'arktype';

// ### Type Definitions
type MqttConfig = {
  mqtt_broker: string;
  mqtt_user: string;
  mqtt_pass: string;
};

type MqttCallback = (
  source: string,
  type: string,
  message: MqttButtonAdv1 | MqttButtonAdv4 | MqttButtonAdv8 | MqttGatewayAlive
) => void;

type MqttButtonAdv1 = {
  type: number;
  dmac: string;
  time: string;
  rssi: number;
  ver: number;
  vbatt: number;
  temp: number;
  humidty: number;
  x0: number;
  y0: number;
  z0: number;
  newTHCnt: number;
};

type MqttButtonAdv4 = {
  type: number;
  dmac: string;
  uuid: string;
  majorID: number;
  minorID: number;
  refpower: number;
  rssi: number;
  time: string;
};

type MqttButtonAdv8 = {
  type: number;
  dmac: string;
  vbatt: number;
  temp: number;
  advCnt: number;
  secCnt: number;
  rssi: number;
  time: string;
};

type MqttGatewayAlive = {
  msg: string;
  gmac: string;
  ver: string;
  subaction: string;
  pubaction: string;
  downDevices: number;
  blever: string;
  wanIP: string;
  hver: string;
  model: string;
  temp: number;
  lowVoltage: number;
  voltageDjk: number;
  load: number;
  mem_free: number;
  utc: number;
  uptime: number;
  state: number;
};

type MqttBeaconMessage = MqttButtonAdv1 | MqttButtonAdv4 | MqttButtonAdv8;

type MqttGatewayAdvData = {
  msg: string;
  gmac: string;
  obj: MqttBeaconMessage[];
};

type ErrorCounter = { count: number };

// ### Utility Function for Safe JSON Parsing
function json_safe_parse(str: string): any {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

// ### Schema Definitions for Each Library

// **Zod Schemas**
const MqttButtonAdv1Schema = z.object({
  type: z.number(),
  dmac: z.string(),
  time: z.string(),
  rssi: z.number(),
  ver: z.number(),
  vbatt: z.number(),
  temp: z.number(),
  humidty: z.number(),
  x0: z.number(),
  y0: z.number(),
  z0: z.number(),
  newTHCnt: z.number(),
});

const MqttButtonAdv4Schema = z.object({
  type: z.number(),
  dmac: z.string(),
  uuid: z.string(),
  majorID: z.number(),
  minorID: z.number(),
  refpower: z.number(),
  rssi: z.number(),
  time: z.string(),
});

const MqttButtonAdv8Schema = z.object({
  type: z.number(),
  dmac: z.string(),
  vbatt: z.number(),
  temp: z.number(),
  advCnt: z.number(),
  secCnt: z.number(),
  rssi: z.number(),
  time: z.string(),
});

const MqttGatewayAliveSchema = z.object({
  msg: z.string(),
  gmac: z.string(),
  ver: z.string(),
  subaction: z.string(),
  pubaction: z.string(),
  downDevices: z.number(),
  blever: z.string(),
  wanIP: z.string(),
  hver: z.string(),
  model: z.string(),
  temp: z.number(),
  lowVoltage: z.number(),
  voltageDjk: z.number(),
  load: z.number(),
  mem_free: z.number(),
  utc: z.number(),
  uptime: z.number(),
  state: z.number(),
});

const MqttBeaconMessageSchema = z.union([
  MqttButtonAdv1Schema,
  MqttButtonAdv4Schema,
  MqttButtonAdv8Schema,
]);

const MqttGatewayAdvDataSchema = z.object({
  msg: z.string(),
  gmac: z.string(),
  obj: z.array(MqttBeaconMessageSchema),
});

const MqttGatewayMessageSchema = z.union([
  MqttGatewayAdvDataSchema,
  MqttGatewayAliveSchema,
]);

// **Valibot Schemas**
const MqttButtonAdv1SchemaValibot = v.object({
  type: v.number(),
  dmac: v.string(),
  time: v.string(),
  rssi: v.number(),
  ver: v.number(),
  vbatt: v.number(),
  temp: v.number(),
  humidty: v.number(),
  x0: v.number(),
  y0: v.number(),
  z0: v.number(),
  newTHCnt: v.number(),
});

const MqttButtonAdv4SchemaValibot = v.object({
  type: v.number(),
  dmac: v.string(),
  uuid: v.string(),
  majorID: v.number(),
  minorID: v.number(),
  refpower: v.number(),
  rssi: v.number(),
  time: v.string(),
});

const MqttButtonAdv8SchemaValibot = v.object({
  type: v.number(),
  dmac: v.string(),
  vbatt: v.number(),
  temp: v.number(),
  advCnt: v.number(),
  secCnt: v.number(),
  rssi: v.number(),
  time: v.string(),
});

const MqttGatewayAliveSchemaValibot = v.object({
  msg: v.string(),
  gmac: v.string(),
  ver: v.string(),
  subaction: v.string(),
  pubaction: v.string(),
  downDevices: v.number(),
  blever: v.string(),
  wanIP: v.string(),
  hver: v.string(),
  model: v.string(),
  temp: v.number(),
  lowVoltage: v.number(),
  voltageDjk: v.number(),
  load: v.number(),
  mem_free: v.number(),
  utc: v.number(),
  uptime: v.number(),
  state: v.number(),
});

const MqttBeaconMessageSchemaValibot = v.union([
  MqttButtonAdv1SchemaValibot,
  MqttButtonAdv4SchemaValibot,
  MqttButtonAdv8SchemaValibot,
]);

const MqttGatewayAdvDataSchemaValibot = v.object({
  msg: v.string(),
  gmac: v.string(),
  obj: v.array(MqttBeaconMessageSchemaValibot),
});

const MqttGatewayMessageSchemaValibot = v.union([
  MqttGatewayAdvDataSchemaValibot,
  MqttGatewayAliveSchemaValibot,
]);

// **ArkType Schemas**
const MqttButtonAdv1SchemaArkType = type({
  type: 'number',
  dmac: 'string',
  time: 'string',
  rssi: 'number',
  ver: 'number',
  vbatt: 'number',
  temp: 'number',
  humidty: 'number',
  x0: 'number',
  y0: 'number',
  z0: 'number',
  newTHCnt: 'number',
});

const MqttButtonAdv4SchemaArkType = type({
  type: 'number',
  dmac: 'string',
  uuid: 'string',
  majorID: 'number',
  minorID: 'number',
  refpower: 'number',
  rssi: 'number',
  time: 'string',
});

const MqttButtonAdv8SchemaArkType = type({
  type: 'number',
  dmac: 'string',
  vbatt: 'number',
  temp: 'number',
  advCnt: 'number',
  secCnt: 'number',
  rssi: 'number',
  time: 'string',
});

const MqttGatewayAliveSchemaArkType = type({
  msg: 'string',
  gmac: 'string',
  ver: 'string',
  subaction: 'string',
  pubaction: 'string',
  downDevices: 'number',
  blever: 'string',
  wanIP: 'string',
  hver: 'string',
  model: 'string',
  temp: 'number',
  lowVoltage: 'number',
  voltageDjk: 'number',
  load: 'number',
  mem_free: 'number',
  utc: 'number',
  uptime: 'number',
  state: 'number',
});

const MqttBeaconMessageSchemaArkType = MqttButtonAdv1SchemaArkType
  .or(MqttButtonAdv4SchemaArkType)
  .or(MqttButtonAdv8SchemaArkType);

const MqttGatewayAdvDataSchemaArkType = type({
  msg: 'string',
  gmac: 'string',
  obj: MqttBeaconMessageSchemaArkType.array(),
});

const MqttGatewayMessageSchemaArkType = MqttGatewayAdvDataSchemaArkType
  .or(MqttGatewayAliveSchemaArkType);

// ### Message Processing Functions for Each Library
async function process_zod(
  message: Buffer,
  callback: MqttCallback,
  errorCounter: ErrorCounter
): Promise<void> {
  const msg_string = message.toString().replace(/[\u0000-\u0019]+/g, "");
  const payload = json_safe_parse(msg_string);
  if (!payload) {
    errorCounter.count++;
    return;
  }

  const result = MqttGatewayMessageSchema.safeParse(payload);
  if (!result.success) {
    errorCounter.count++;
    return;
  }

  const validatedPayload = result.data;
  if (validatedPayload.msg === 'advData') {
    const payload_adv = validatedPayload as MqttGatewayAdvData;
    payload_adv.obj.forEach((obj) => {
      if (obj.type === 1) {
        callback(payload_adv.gmac, 'adv1', obj as MqttButtonAdv1);
      } else if (obj.type === 4) {
        callback(payload_adv.gmac, 'adv4', obj as MqttButtonAdv4);
      } else if (obj.type === 8) {
        callback(payload_adv.gmac, 'adv8', obj as MqttButtonAdv8);
      }
    });
  } else if (validatedPayload.msg === 'alive') {
    callback(validatedPayload.gmac, 'alive', validatedPayload as MqttGatewayAlive);
  }
}

async function process_valibot(
  message: Buffer,
  callback: MqttCallback,
  errorCounter: ErrorCounter
): Promise<void> {
  const msg_string = message.toString().replace(/[\u0000-\u0019]+/g, "");
  const payload = json_safe_parse(msg_string);
  if (!payload) {
    errorCounter.count++;
    return;
  }

  const result = v.safeParse(MqttGatewayMessageSchemaValibot, payload);
  if (!result.success) {
    errorCounter.count++;
    return;
  }

  const validatedPayload = result.output;
  if (validatedPayload.msg === 'advData') {
    const payload_adv = validatedPayload as MqttGatewayAdvData;
    payload_adv.obj.forEach((obj) => {
      if (obj.type === 1) {
        callback(payload_adv.gmac, 'adv1', obj as MqttButtonAdv1);
      } else if (obj.type === 4) {
        callback(payload_adv.gmac, 'adv4', obj as MqttButtonAdv4);
      } else if (obj.type === 8) {
        callback(payload_adv.gmac, 'adv8', obj as MqttButtonAdv8);
      }
    });
  } else if (validatedPayload.msg === 'alive') {
    callback(validatedPayload.gmac, 'alive', validatedPayload as MqttGatewayAlive);
  }
}

async function process_arktype(
  message: Buffer,
  callback: MqttCallback,
  errorCounter: ErrorCounter
): Promise<void> {
  const msg_string = message.toString().replace(/[\u0000-\u0019]+/g, "");
  const payload = json_safe_parse(msg_string);
  if (!payload) {
    errorCounter.count++;
    return;
  }

  const result = MqttGatewayMessageSchemaArkType(payload);
  if (result instanceof ArkErrors) {
    errorCounter.count++;
    return; // Removed console.log for consistency and performance
  }
  const validatedPayload = result;
  if (validatedPayload.msg === 'advData') {
    const payload_adv = validatedPayload as MqttGatewayAdvData;
    payload_adv.obj.forEach((obj) => {
      if (obj.type === 1) {
        callback(payload_adv.gmac, 'adv1', obj as MqttButtonAdv1);
      } else if (obj.type === 4) {
        callback(payload_adv.gmac, 'adv4', obj as MqttButtonAdv4);
      } else if (obj.type === 8) {
        callback(payload_adv.gmac, 'adv8', obj as MqttButtonAdv8);
      }
    });
  } else if (validatedPayload.msg === 'alive') {
    callback(validatedPayload.gmac, 'alive', validatedPayload as MqttGatewayAlive);
  }
}

// ### MQTT Start Function
async function mqtt_start(
  config: MqttConfig,
  messageHandler: (topic: string, message: Buffer) => void
): Promise<mqtt.MqttClient> {
  const client = mqtt.connect(config.mqtt_broker, {
    username: config.mqtt_user,
    password: config.mqtt_pass,
  });

  client.on('connect', () => {
    client.subscribe('#');
  });

  client.on('message', messageHandler);

  client.on('error', (err) => {
    console.error('MQTT Error:', err);
  });

  return client;
}

// ### Define Process Function Type
type ProcessFunction = (
  message: Buffer,
  callback: MqttCallback,
  errorCounter: ErrorCounter
) => Promise<void>;

// ### Benchmark Function
interface BenchmarkResult {
  library: string;
  messagesProcessed: number;
  messagesPerSecond: number;
  cpuUserTime: number; // in ms
  cpuSystemTime: number; // in ms
  memoryUsed: number; // in bytes
  validationErrors: number; // Added validation errors
}

async function benchmark(
  library: string,
  processFn: ProcessFunction,
  config: MqttConfig
): Promise<BenchmarkResult> {
  const duration = 60 * 1000; // 1 minute
  let messageCount = 0;
  const errorCounter = { count: 0 }; // Initialize error counter
  const startTime = performance.now();
  const startCpu = process.cpuUsage();
  const startMemory = process.memoryUsage().heapUsed;

  const callback: MqttCallback = () => {
    messageCount++;
  };

  const messageHandler = (_topic: string, message: Buffer) => {
    processFn(message, callback, errorCounter); // Pass errorCounter
  };

  const client = await mqtt_start(config, messageHandler);

  return new Promise((resolve) => {
    setTimeout(() => {
      client.end();
      const endTime = performance.now();
      const endCpu = process.cpuUsage(startCpu);
      const endMemory = process.memoryUsage().heapUsed;
      const timeElapsed = (endTime - startTime) / 1000; // in seconds
      const cpuUser = endCpu.user / 1000; // in milliseconds
      const cpuSystem = endCpu.system / 1000; // in milliseconds
      const memoryUsed = endMemory - startMemory;

      resolve({
        library,
        messagesProcessed: messageCount,
        messagesPerSecond: messageCount / timeElapsed,
        cpuUserTime: cpuUser,
        cpuSystemTime: cpuSystem,
        memoryUsed,
        validationErrors: errorCounter.count, // Include validation errors
      });
    }, duration);
  });
}

// ### Display Results in a Table
function displayResults(results: BenchmarkResult[]) {
  console.log('\n### Benchmark Results');
  console.log(
    '|----------------|---------------|-------------|-----------------|-----------------|-------------|-------------------|'
  );
  console.log(
    '| Library        | Msg Processed | Msgs/Second | CPU User (ms)   | CPU System (ms) | Memory (MB) | Validation Errors |'
  );
  console.log(
    '|----------------|---------------|-------------|-----------------|-----------------|-------------|-------------------|'
  );
  results.forEach((result) => {
    console.log(
      `| ${result.library.padEnd(14)} | ${String(result.messagesProcessed).padEnd(13)} | ${result.messagesPerSecond.toFixed(2).padEnd(11)} | ${result.cpuUserTime.toFixed(2).padEnd(15)} | ${result.cpuSystemTime.toFixed(2).padEnd(15)} | ${(result.memoryUsed/(1024*1024)).toFixed(2).padEnd(11)} | ${result.validationErrors.toString().padEnd(17)} |`
    );
  });
  console.log(
    '|----------------|---------------|-------------|-----------------|-----------------|-------------|-------------------|'
  );
}

// ### Main Function
async function main() {
  const config: MqttConfig = {
    mqtt_broker: 'mqtt://test.example.com:1883',
    mqtt_user: 'test-user',
    mqtt_pass: 'test-password',
  };

  const results: BenchmarkResult[] = [];
  console.log('Starting benchmark for Zod...');
  results.push(await benchmark('Zod', process_zod, config));

  console.log('Starting benchmark for Valibot...');
  results.push(await benchmark('Valibot', process_valibot, config));

  console.log('Starting benchmark for ArkType...');
  results.push(await benchmark('ArkType', process_arktype, config));

  displayResults(results);
}

main().catch((err) => console.error('Error running benchmark:', err));

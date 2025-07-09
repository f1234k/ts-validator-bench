import { performance } from "perf_hooks";
import * as mqtt from "mqtt";

import type { MqttConfig, MqttCallback, ErrorCounter } from "./types";

import {
  process_validathor,
  process_zod,
  process_valibot,
  process_arktype,
  process_sury,
} from "./validators";

// ### MQTT Start Function
async function mqtt_start(
  config: MqttConfig,
  messageHandler: (topic: string, message: Buffer) => void
): Promise<mqtt.MqttClient> {
  const client = mqtt.connect(config.mqtt_broker, {
    username: config.mqtt_user,
    password: config.mqtt_pass,
  });

  client.on("connect", () => {
    client.subscribe("#");
  });

  client.on("message", messageHandler);

  client.on("error", (err) => {
    console.error("MQTT Error:", err);
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
  console.log("\n### Benchmark Results");
  console.log(
    "|----------------|---------------|-------------|-----------------|-----------------|-------------|-------------------|"
  );
  console.log(
    "| Library        | Msg Processed | Msgs/Second | CPU User (ms)   | CPU System (ms) | Memory (MB) | Validation Errors |"
  );
  console.log(
    "|----------------|---------------|-------------|-----------------|-----------------|-------------|-------------------|"
  );
  results.forEach((result) => {
    console.log(
      `| ${result.library.padEnd(14)} | ${String(
        result.messagesProcessed
      ).padEnd(13)} | ${result.messagesPerSecond
        .toFixed(2)
        .padEnd(11)} | ${result.cpuUserTime
        .toFixed(2)
        .padEnd(15)} | ${result.cpuSystemTime.toFixed(2).padEnd(15)} | ${(
        result.memoryUsed /
        (1024 * 1024)
      )
        .toFixed(2)
        .padEnd(11)} | ${result.validationErrors.toString().padEnd(17)} |`
    );
  });
  console.log(
    "|----------------|---------------|-------------|-----------------|-----------------|-------------|-------------------|"
  );
}

// ### Main Function
async function main() {
  const config: MqttConfig = {
    mqtt_broker: "mqtt://test.example.com:1883",
    mqtt_user: "test-user",
    mqtt_pass: "test-password",
  };

  const results: BenchmarkResult[] = [];

  console.log("Starting benchmark for Zod...");
  results.push(await benchmark("Zod", process_zod, config));

  console.log("Starting benchmark for Valibot...");
  results.push(await benchmark("Valibot", process_valibot, config));

  console.log("Starting benchmark for ArkType...");
  results.push(await benchmark("ArkType", process_arktype, config));

  console.log("Starting benchmark for Validathor...");
  results.push(await benchmark("Validathor", process_validathor, config));

  console.log("Starting benchmark for Sury...");
  results.push(await benchmark("Sury", process_sury, config));

  displayResults(results);
}

main().catch((err) => console.error("Error running benchmark:", err));

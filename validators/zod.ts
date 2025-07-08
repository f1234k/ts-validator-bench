import { z } from "zod";

import { json_safe_parse } from "../utils";
import type {
  ErrorCounter,
  MqttButtonAdv1,
  MqttButtonAdv4,
  MqttButtonAdv8,
  MqttCallback,
  MqttGatewayAdvData,
  MqttGatewayAlive,
} from "../types";

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

export async function process_zod(
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
  if (validatedPayload.msg === "advData") {
    const payload_adv = validatedPayload as MqttGatewayAdvData;
    payload_adv.obj.forEach((obj) => {
      if (obj.type === 1) {
        callback(payload_adv.gmac, "adv1", obj as MqttButtonAdv1);
      } else if (obj.type === 4) {
        callback(payload_adv.gmac, "adv4", obj as MqttButtonAdv4);
      } else if (obj.type === 8) {
        callback(payload_adv.gmac, "adv8", obj as MqttButtonAdv8);
      }
    });
  } else if (validatedPayload.msg === "alive") {
    callback(
      validatedPayload.gmac,
      "alive",
      validatedPayload as MqttGatewayAlive
    );
  }
}

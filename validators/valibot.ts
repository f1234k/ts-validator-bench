import * as v from "valibot";

import { json_safe_parse } from "../utils";
import type {
  ErrorCounter,
  MqttCallback,
} from "../types";

const MqttButtonAdv1SchemaValibot = v.object({
  type: v.literal(1),
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
  type: v.literal(4),
  dmac: v.string(),
  uuid: v.string(),
  majorID: v.number(),
  minorID: v.number(),
  refpower: v.number(),
  rssi: v.number(),
  time: v.string(),
});

const MqttButtonAdv8SchemaValibot = v.object({
  type: v.literal(8),
  dmac: v.string(),
  vbatt: v.number(),
  temp: v.number(),
  advCnt: v.number(),
  secCnt: v.number(),
  rssi: v.number(),
  time: v.string(),
});

const MqttGatewayAliveSchemaValibot = v.object({
  msg: v.literal("alive"),
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
  msg: v.literal("advData"),
  gmac: v.string(),
  obj: v.array(MqttBeaconMessageSchemaValibot),
});

const MqttGatewayMessageSchemaValibot = v.union([
  MqttGatewayAdvDataSchemaValibot,
  MqttGatewayAliveSchemaValibot,
]);

export async function process_valibot(
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
  if (validatedPayload.msg === "advData") {
    const payload_adv = validatedPayload;
    payload_adv.obj.forEach((obj) => {
      if (obj.type === 1) {
        callback(payload_adv.gmac, "adv1", obj);
      } else if (obj.type === 4) {
        callback(payload_adv.gmac, "adv4", obj);
      } else if (obj.type === 8) {
        callback(payload_adv.gmac, "adv8", obj);
      }
    });
  } else if (validatedPayload.msg === "alive") {
    callback(
      validatedPayload.gmac,
      "alive",
      validatedPayload
    );
  }
}

import * as v from "@nordic-ui/validathor";

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

const MqttButtonAdv1SchemaValidathor = v.object({
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

const MqttButtonAdv4SchemaValidathor = v.object({
  type: v.number(),
  dmac: v.string(),
  uuid: v.string(),
  majorID: v.number(),
  minorID: v.number(),
  refpower: v.number(),
  rssi: v.number(),
  time: v.string(),
});

const MqttButtonAdv8SchemaValidathor = v.object({
  type: v.number(),
  dmac: v.string(),
  vbatt: v.number(),
  temp: v.number(),
  advCnt: v.number(),
  secCnt: v.number(),
  rssi: v.number(),
  time: v.string(),
});

const MqttGatewayAliveSchemaValidathor = v.object({
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

const MqttBeaconMessageSchemaValidathor = v.union([
  MqttButtonAdv1SchemaValidathor,
  MqttButtonAdv4SchemaValidathor,
  MqttButtonAdv8SchemaValidathor,
]);

const MqttGatewayAdvDataSchemaValidathor = v.object({
  msg: v.string(),
  gmac: v.string(),
  obj: v.array(MqttBeaconMessageSchemaValidathor),
});

const MqttGatewayMessageSchemaValidathor = v.union([
  MqttGatewayAdvDataSchemaValidathor,
  MqttGatewayAliveSchemaValidathor,
]);

export async function process_validathor(
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

  let result;

  try {
    result = MqttGatewayMessageSchemaValidathor.parse(payload);
  } catch {
    errorCounter.count++;
    return;
  }

  const validatedPayload = result;
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

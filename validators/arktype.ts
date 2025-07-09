import { ArkErrors, type } from "arktype";

import { json_safe_parse } from "../utils";
import type {
  ErrorCounter,
  MqttCallback,
} from "../types";

const MqttButtonAdv1SchemaArkType = type({
  type: type.unit(1),
  dmac: "string",
  time: "string",
  rssi: "number",
  ver: "number",
  vbatt: "number",
  temp: "number",
  humidty: "number",
  x0: "number",
  y0: "number",
  z0: "number",
  newTHCnt: "number",
});

const MqttButtonAdv4SchemaArkType = type({
  type: type.unit(4),
  dmac: "string",
  uuid: "string",
  majorID: "number",
  minorID: "number",
  refpower: "number",
  rssi: "number",
  time: "string",
});

const MqttButtonAdv8SchemaArkType = type({
  type: type.unit(8),
  dmac: "string",
  vbatt: "number",
  temp: "number",
  advCnt: "number",
  secCnt: "number",
  rssi: "number",
  time: "string",
});

const MqttGatewayAliveSchemaArkType = type({
  msg: type.unit("alive"),
  gmac: "string",
  ver: "string",
  subaction: "string",
  pubaction: "string",
  downDevices: "number",
  blever: "string",
  wanIP: "string",
  hver: "string",
  model: "string",
  temp: "number",
  lowVoltage: "number",
  voltageDjk: "number",
  load: "number",
  mem_free: "number",
  utc: "number",
  uptime: "number",
  state: "number",
});

const MqttBeaconMessageSchemaArkType = MqttButtonAdv1SchemaArkType.or(
  MqttButtonAdv4SchemaArkType
).or(MqttButtonAdv8SchemaArkType);

const MqttGatewayAdvDataSchemaArkType = type({
  msg: type.unit("advData"),
  gmac: "string",
  obj: MqttBeaconMessageSchemaArkType.array(),
});

const MqttGatewayMessageSchemaArkType = MqttGatewayAdvDataSchemaArkType.or(
  MqttGatewayAliveSchemaArkType
);

export async function process_arktype(
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
    return;
  }

  const validatedPayload = result;
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

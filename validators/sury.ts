import * as S from "sury";

import type { ErrorCounter, MqttCallback } from "../types";

const MqttButtonAdv1Schema = S.schema({
  type: 1 as const,
  dmac: S.string,
  time: S.string,
  rssi: S.number,
  ver: S.number,
  vbatt: S.number,
  temp: S.number,
  humidty: S.number,
  x0: S.number,
  y0: S.number,
  z0: S.number,
  newTHCnt: S.number,
});

const MqttButtonAdv4Schema = S.schema({
  type: 4 as const,
  dmac: S.string,
  uuid: S.string,
  majorID: S.number,
  minorID: S.number,
  refpower: S.number,
  rssi: S.number,
  time: S.string,
});

const MqttButtonAdv8Schema = S.schema({
  type: 8 as const,
  dmac: S.string,
  vbatt: S.number,
  temp: S.number,
  advCnt: S.number,
  secCnt: S.number,
  rssi: S.number,
  time: S.string,
});

const MqttGatewayAliveSchema = S.schema({
  msg: "alive" as const,
  gmac: S.string,
  ver: S.string,
  subaction: S.string,
  pubaction: S.string,
  downDevices: S.number,
  blever: S.string,
  wanIP: S.string,
  hver: S.string,
  model: S.string,
  temp: S.number,
  lowVoltage: S.number,
  voltageDjk: S.number,
  load: S.number,
  mem_free: S.number,
  utc: S.number,
  uptime: S.number,
  state: S.number,
});

const MqttBeaconMessageSchema = S.union([
  MqttButtonAdv1Schema,
  MqttButtonAdv4Schema,
  MqttButtonAdv8Schema,
]);

const MqttGatewayAdvDataSchema = S.schema({
  msg: "advData" as const,
  gmac: S.string,
  obj: S.array(MqttBeaconMessageSchema),
});

const MqttGatewayMessageSchema = S.union([
  MqttGatewayAdvDataSchema,
  MqttGatewayAliveSchema,
]);

export async function process_sury(
  message: Buffer,
  callback: MqttCallback,
  errorCounter: ErrorCounter
): Promise<void> {
  const msg_string = message.toString().replace(/[\u0000-\u0019]+/g, "");

  const result = S.safe(() =>
    S.parseJsonStringOrThrow(msg_string, MqttGatewayMessageSchema)
  );
  if (!result.success) {
    errorCounter.count++;
    return;
  }

  const mqttGatewayMessage = result.value;
  if (mqttGatewayMessage.msg === "advData") {
    const mqttGatewayAdvData = mqttGatewayMessage;
    mqttGatewayAdvData.obj.forEach((obj) => {
      if (obj.type === 1) {
        callback(mqttGatewayAdvData.gmac, "adv1", obj);
      } else if (obj.type === 4) {
        callback(mqttGatewayAdvData.gmac, "adv4", obj);
      } else if (obj.type === 8) {
        callback(mqttGatewayAdvData.gmac, "adv8", obj);
      }
    });
  } else if (mqttGatewayMessage.msg === "alive") {
    callback(mqttGatewayMessage.gmac, "alive", mqttGatewayMessage);
  }
}

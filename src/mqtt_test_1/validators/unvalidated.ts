import { json_safe_parse } from "../../helpers/utils";
import type {
  ErrorCounter,
  MqttButtonAdv1,
  MqttButtonAdv4,
  MqttButtonAdv8,
  MqttCallback,
  MqttGatewayAdvData,
  MqttGatewayAlive,
} from "../types";

export async function process_unvalidated(
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

  const unValidatedPayload = payload;
  if (unValidatedPayload.msg === "advData") {
    const payload_adv = unValidatedPayload as MqttGatewayAdvData;
    payload_adv.obj.forEach((obj) => {
      if (obj.type === 1) {
        callback(payload_adv.gmac, "adv1", obj as MqttButtonAdv1);
      } else if (obj.type === 4) {
        callback(payload_adv.gmac, "adv4", obj as MqttButtonAdv4);
      } else if (obj.type === 8) {
        callback(payload_adv.gmac, "adv8", obj as MqttButtonAdv8);
      }
    });
  } else if (unValidatedPayload.msg === "alive") {
    callback(
      unValidatedPayload.gmac,
      "alive",
      unValidatedPayload as MqttGatewayAlive
    );
  }
}
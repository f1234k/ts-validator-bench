// ### Type Definitions
export type MqttConfig = {
  mqtt_broker: string;
  mqtt_user: string;
  mqtt_pass: string;
};

export type MqttCallback = (
  source: string,
  type: string,
  message: MqttButtonAdv1 | MqttButtonAdv4 | MqttButtonAdv8 | MqttGatewayAlive
) => void;

export type MqttButtonAdv1 = {
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

export type MqttButtonAdv4 = {
  type: number;
  dmac: string;
  uuid: string;
  majorID: number;
  minorID: number;
  refpower: number;
  rssi: number;
  time: string;
};

export type MqttButtonAdv8 = {
  type: number;
  dmac: string;
  vbatt: number;
  temp: number;
  advCnt: number;
  secCnt: number;
  rssi: number;
  time: string;
};

export type MqttGatewayAlive = {
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

export type MqttBeaconMessage =
  | MqttButtonAdv1
  | MqttButtonAdv4
  | MqttButtonAdv8;

export type MqttGatewayAdvData = {
  msg: string;
  gmac: string;
  obj: MqttBeaconMessage[];
};

export type ErrorCounter = { count: number };

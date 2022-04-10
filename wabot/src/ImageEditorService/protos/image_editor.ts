/* eslint-disable */
import Long from "long";
import {
  makeGenericClientConstructor,
  ChannelCredentials,
  ChannelOptions,
  UntypedServiceImplementation,
  handleUnaryCall,
  Client,
  ClientUnaryCall,
  Metadata,
  CallOptions,
  ServiceError,
} from "@grpc/grpc-js";
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "";

export interface GradesRequest {
  text1: string;
  text2: string;
}

export interface GradesResponse {
  image: Uint8Array;
}

function createBaseGradesRequest(): GradesRequest {
  return { text1: "", text2: "" };
}

export const GradesRequest = {
  encode(
    message: GradesRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.text1 !== "") {
      writer.uint32(10).string(message.text1);
    }
    if (message.text2 !== "") {
      writer.uint32(18).string(message.text2);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GradesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGradesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.text1 = reader.string();
          break;
        case 2:
          message.text2 = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GradesRequest {
    return {
      text1: isSet(object.text1) ? String(object.text1) : "",
      text2: isSet(object.text2) ? String(object.text2) : "",
    };
  },

  toJSON(message: GradesRequest): unknown {
    const obj: any = {};
    message.text1 !== undefined && (obj.text1 = message.text1);
    message.text2 !== undefined && (obj.text2 = message.text2);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GradesRequest>, I>>(
    object: I
  ): GradesRequest {
    const message = createBaseGradesRequest();
    message.text1 = object.text1 ?? "";
    message.text2 = object.text2 ?? "";
    return message;
  },
};

function createBaseGradesResponse(): GradesResponse {
  return { image: new Uint8Array() };
}

export const GradesResponse = {
  encode(
    message: GradesResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.image.length !== 0) {
      writer.uint32(10).bytes(message.image);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GradesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGradesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.image = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GradesResponse {
    return {
      image: isSet(object.image)
        ? bytesFromBase64(object.image)
        : new Uint8Array(),
    };
  },

  toJSON(message: GradesResponse): unknown {
    const obj: any = {};
    message.image !== undefined &&
      (obj.image = base64FromBytes(
        message.image !== undefined ? message.image : new Uint8Array()
      ));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GradesResponse>, I>>(
    object: I
  ): GradesResponse {
    const message = createBaseGradesResponse();
    message.image = object.image ?? new Uint8Array();
    return message;
  },
};

export const ImageEditorService = {
  grades: {
    path: "/ImageEditor/Grades",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: GradesRequest) =>
      Buffer.from(GradesRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => GradesRequest.decode(value),
    responseSerialize: (value: GradesResponse) =>
      Buffer.from(GradesResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => GradesResponse.decode(value),
  },
} as const;

export interface ImageEditorServer extends UntypedServiceImplementation {
  grades: handleUnaryCall<GradesRequest, GradesResponse>;
}

export interface ImageEditorClient extends Client {
  grades(
    request: GradesRequest,
    callback: (error: ServiceError | null, response: GradesResponse) => void
  ): ClientUnaryCall;
  grades(
    request: GradesRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: GradesResponse) => void
  ): ClientUnaryCall;
  grades(
    request: GradesRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: GradesResponse) => void
  ): ClientUnaryCall;
}

export const ImageEditorClient = makeGenericClientConstructor(
  ImageEditorService,
  "ImageEditor"
) as unknown as {
  new (
    address: string,
    credentials: ChannelCredentials,
    options?: Partial<ChannelOptions>
  ): ImageEditorClient;
  service: typeof ImageEditorService;
};

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  throw "Unable to locate global object";
})();

const atob: (b64: string) => string =
  globalThis.atob ||
  ((b64) => globalThis.Buffer.from(b64, "base64").toString("binary"));
function bytesFromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; ++i) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
}

const btoa: (bin: string) => string =
  globalThis.btoa ||
  ((bin) => globalThis.Buffer.from(bin, "binary").toString("base64"));
function base64FromBytes(arr: Uint8Array): string {
  const bin: string[] = [];
  arr.forEach((byte) => {
    bin.push(String.fromCharCode(byte));
  });
  return btoa(bin.join(""));
}

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<
        Exclude<keyof I, KeysOfUnion<P>>,
        never
      >;

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

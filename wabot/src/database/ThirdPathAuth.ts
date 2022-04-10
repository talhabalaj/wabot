import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
} from "@typegoose/typegoose";
import mongoose from "mongoose";

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class ThirdPartyAuth {
  @prop({ type: () => mongoose.Schema.Types.Mixed })
  public creds?: any;

  @prop({ type: () => String })
  public name?: string;

  @prop({ type: () => String })
  public type?: string;
}

export const ThirdPartyAuthModel = getModelForClass(ThirdPartyAuth);

import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
} from "@typegoose/typegoose";
import mongoose from "mongoose";

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class FeatureStore {
  @prop({ type: () => String })
  public name?: string;

  @prop({ type: () => mongoose.Schema.Types.Mixed })
  public store?: any;
}

export const FeatureStoreModel = getModelForClass(FeatureStore);

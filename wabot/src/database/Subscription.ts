import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
} from "@typegoose/typegoose";

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class Subscription {
  @prop({ type: () => String })
  public jid?: string;

  @prop({ type: () => String })
  public name?: string;
}

export const SubscriptionModel = getModelForClass(Subscription);

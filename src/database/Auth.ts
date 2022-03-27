import { AuthenticationState } from "@adiwajshing/baileys";
import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
} from "@typegoose/typegoose";
import mongoose from "mongoose";

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class AuthClass {
  @prop({ type: () => mongoose.Schema.Types.Mixed })
  public authState?: AuthenticationState;

  @prop({ type: () => String })
  public jid?: string;

  @prop({ type: () => Number })
  public device?: number;
}

export const AuthModel = getModelForClass(AuthClass);


import { prop, getModelForClass } from '@typegoose/typegoose';
import { Double } from 'mongodb';

class UserSetting {
  @prop({ required: true })
  public userId!: string;

  @prop({ required: true })
  public launchPK!: string;

  @prop({ required: true })
  public enableDevnet!: boolean;

  @prop({ required: true })
  public rpcURL!: string;

  @prop({ required: true })
  public priorityFee!: Double;

  @prop({ required: true })
  public jitoTips!: Double;
}

const UserSettingsModel = getModelForClass(UserSetting);

export { UserSetting, UserSettingsModel };


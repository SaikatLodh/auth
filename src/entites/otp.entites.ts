import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type otpDocument = Otp & Document;

@Schema({ timestamps: true })
export class Otp {
  @Prop({
    type: String,
    unique: true,
  })
  email!: string;

  @Prop({
    type: Number,
    required: true,
  })
  otp!: number;

  @Prop({
    type: Date,
    default: null,
    required: true,
  })
  otpExpire!: Date;

  @Prop({
    type: Boolean,
    default: false,
  })
  isotpsend!: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  otpVerified!: boolean;
}

export const otpSchema = SchemaFactory.createForClass(Otp);

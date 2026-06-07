import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type userDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  fullName!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    unique: true,
  })
  email!: string;

  @Prop({
    type: String,
    required: true,
  })
  password!: string;

  @Prop({
    type: {
      public_id: String,
      url: String,
    },
  })
  profilePicture!: {
    public_id: string;
    url: string;
  };

  @Prop({ type: String })
  googleAvatar!: string;

  @Prop({
    type: String,
    enum: ['user', 'instructor', 'admin'],
    default: 'user',
  })
  role!: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isVerified!: boolean;

  @Prop({
    type: String,
    default: null,
  })
  forgotPasswordToken!: string;

  @Prop({
    type: Date,
    default: null,
  })
  forgotPasswordExpiry!: Date;

  @Prop({
    type: String,
    default: null,
    expires: 1000 * 60 * 60 * 24 * 7,
  })
  refreshToken!: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isDeleted!: boolean;
}

export const userSchema = SchemaFactory.createForClass(User);

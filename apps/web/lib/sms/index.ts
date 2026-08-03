import { isMsg91Configured, isSmsDevModeEnv } from "@/lib/env/msg91";

export function isSmsDevMode(): boolean {
  return isSmsDevModeEnv();
}

export {
  isWidgetOtpMode,
  isMsg91ManagedMode,
  sendManagedOtp,
  verifyManagedOtp,
} from "./msg91-managed-otp";

export {
  sendWidgetOtp,
  verifyWidgetOtp,
  verifyWidgetAccessToken,
} from "./widget-otp";

export { isLegacyTemplateOtpMode, sendOtpSms, sendDoctorStatusSms } from "./legacy-sms";

export { isMsg91Configured };

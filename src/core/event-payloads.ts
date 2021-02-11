export enum NotificationTransport {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WEB = 'WEB',
}

export enum NotificationsType {
  SUCCESSFULL_REGISTRATION = 'SUCCESSFULL_REGISTRATION',
  EMAIL_CONFIRMATION = 'EMAIL_CONFIRMATION',
  PASSWORD_RECOVERY = 'PASSWORD_RECOVERY',
}

export const notificationsTemplateMapping = {
  [NotificationsType.SUCCESSFULL_REGISTRATION]: 'registration_success',
};

export interface NotificationPayload {
  userId: string;
  lang: string;
  params: { [key: string]: any };
  type: NotificationsType;
  transports: NotificationTransport[];
}

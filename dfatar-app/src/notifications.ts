import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function getNotificationPermissionGranted(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function sendTestReminderNotification(body: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Bankee', body },
    trigger: null,
  });
}

export function reminderDateFor(dueDate: string, offsetDays: number): Date {
  const d = new Date(`${dueDate}T09:00:00`);
  d.setDate(d.getDate() - offsetDays);
  return d;
}

export async function scheduleDebtReminder(
  customerName: string,
  amount: number,
  dueDate: string,
  offsetDays: number
): Promise<string | null> {
  const granted = await getNotificationPermissionGranted();
  if (!granted) return null;

  const fireDate = reminderDateFor(dueDate, offsetDays);
  if (fireDate.getTime() <= Date.now()) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Bankee — échéance',
      body: `${customerName} doit ${amount} — échéance le ${dueDate}.`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireDate },
  });
}

export async function cancelScheduledNotification(notificationId: string | null | undefined): Promise<void> {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

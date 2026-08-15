import { onNotificationReceived, scheduleLocalNotification, NOTIFICATION_TYPES } from '../services/notifications';
import usePrefsStore from '../store/prefsStore';

describe('notification suppression', () => {
  beforeEach(() => {
    // reset prefs
    const s = usePrefsStore.getState();
    s.setAllEnabled(true);
    const defaults = Object.values(NOTIFICATION_TYPES).reduce((acc: any, t) => ({ ...acc, [t]: true }), {});
    usePrefsStore.setState({ notificationPrefs: defaults } as any);
  });

  test('does not fire when type is disabled', async () => {
    const called: any[] = [];
    const unsub = onNotificationReceived(p => called.push(p));

    const type = Object.values(NOTIFICATION_TYPES)[0];
    usePrefsStore.getState().toggleType(type, false);

    await scheduleLocalNotification({ title: 'x', body: 'y', data: { type }, type });
    expect(called.length).toBe(0);
    unsub();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notifications } from '@mantine/notifications';
import { notify } from '../notify';

vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn(), update: vi.fn(), hide: vi.fn() },
}));

describe('notify', () => {
  beforeEach(() => {
    vi.mocked(notifications.show).mockClear();
    vi.mocked(notifications.update).mockClear();
    vi.mocked(notifications.hide).mockClear();
  });

  it('gives every tone its own colour and an icon', () => {
    notify.success({ title: 'Saved', message: 'Water Board' });
    notify.error({ title: 'Not saved', message: 'Try again' });
    notify.warning({ message: 'Check this' });
    notify.info({ message: 'FYI', autoClose: 2000 });
    const calls = vi.mocked(notifications.show).mock.calls.map(([arg]) => arg);
    expect(calls.map((c) => c.color)).toEqual(['teal', 'red', 'orange', 'blue']);
    expect(calls.every((c) => c.icon !== undefined)).toBe(true);
    expect(calls[0]).toMatchObject({ title: 'Saved', message: 'Water Board' });
    expect(calls[3]).toMatchObject({ message: 'FYI', autoClose: 2000 });
  });

  it('updates and hides a toast by its id', () => {
    notify.update('success', { id: 'sync', message: 'Done' });
    notify.hide('sync');
    expect(notifications.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'sync', message: 'Done', color: 'teal' })
    );
    expect(notifications.hide).toHaveBeenCalledWith('sync');
  });
});

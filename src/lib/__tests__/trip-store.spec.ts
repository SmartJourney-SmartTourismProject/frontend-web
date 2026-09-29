import { beforeEach, describe, expect, it } from 'vitest';
import { useTripStore } from '../trip-store';

const initialState = useTripStore.getState();

beforeEach(() => {
  useTripStore.setState(initialState, true);
  localStorage.clear();
});

describe('useTripStore', () => {
  it('setPlan replaces the itinerary/destination/cost/currency together', () => {
    useTripStore
      .getState()
      .setPlan({
        itinerary: [{ day: 1, items: [] }],
        destination: 'Kandy',
        estimatedCost: 5000,
        currency: 'USD',
        startLocation: null,
      });

    const state = useTripStore.getState();
    expect(state.destination).toBe('Kandy');
    expect(state.estimatedCost).toBe(5000);
    expect(state.currency).toBe('USD');
  });

  it('reset clears the plan but not sessionsVersion', () => {
    useTripStore.getState().setSessionId('session-1');
    useTripStore.getState().bumpSessionsVersion();
    useTripStore
      .getState()
      .setPlan({
        itinerary: [{ day: 1, items: [] }],
        destination: 'Kandy',
        estimatedCost: 5000,
        currency: 'USD',
        startLocation: null,
      });

    useTripStore.getState().reset();

    const state = useTripStore.getState();
    expect(state.sessionId).toBeNull();
    expect(state.itinerary).toEqual([]);
    expect(state.destination).toBeNull();
    // The origin drives the map's departure leg, so a stale one would draw a
    // route from the previous trip's start into the new plan.
    expect(state.startLocation).toBeNull();
    expect(state.sessionsVersion).toBe(1);
  });

  it('only persists sessionId to localStorage, not the itinerary/plan fields', () => {
    useTripStore
      .getState()
      .setPlan({
        itinerary: [{ day: 1, items: [] }],
        destination: 'Kandy',
        estimatedCost: 5000,
        currency: 'USD',
        startLocation: null,
      });
    useTripStore.getState().setSessionId('session-1');

    const stored = JSON.parse(localStorage.getItem('smartjourney-trip-store') ?? '{}');

    expect(stored.state).toEqual({ sessionId: 'session-1' });
  });
});

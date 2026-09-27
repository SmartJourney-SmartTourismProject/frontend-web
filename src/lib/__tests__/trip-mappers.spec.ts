import { describe, expect, it } from 'vitest';
import { tripToItineraryDays } from '../trip-mappers';
import type { TripDetail, TripItineraryDay, TripItineraryItem } from '../types';

function item(overrides: Partial<TripItineraryItem> = {}): TripItineraryItem {
  return {
    id: 'item-1',
    itinerary_day_id: 'day-1',
    listing_id: null,
    event_id: null,
    item_type: 'sight',
    name: 'Temple of the Tooth',
    latitude: 7.29,
    longitude: 80.64,
    start_time: '1970-01-01T09:05:00.000Z',
    end_time: null,
    est_cost: null,
    order_index: 0,
    notes: null,
    ...overrides,
  };
}

function day(overrides: Partial<TripItineraryDay> = {}): TripItineraryDay {
  return {
    id: 'day-1',
    itinerary_id: 'trip-1',
    day_number: 1,
    date: '2026-05-01',
    itinerary_item: [item()],
    ...overrides,
  };
}

function trip(days: TripItineraryDay[]): TripDetail {
  return {
    id: 'trip-1',
    user_id: 'user-1',
    district_id: null,
    title: 'Kandy trip',
    start_date: null,
    end_date: null,
    travelers: 1,
    budget: null,
    estimated_cost: null,
    currency: 'LKR',
    status: 'draft',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    district: null,
    itinerary_day: days,
  };
}

describe('tripToItineraryDays', () => {
  it('converts a saved day into the ItineraryDay shape, formatting start_time as HH:MM UTC', () => {
    const result = tripToItineraryDays(trip([day()]));

    expect(result).toEqual([
      {
        day: 1,
        date: '2026-05-01',
        items: [
          {
            time: '09:05',
            type: 'sight',
            name: 'Temple of the Tooth',
            notes: null,
            lat: 7.29,
            lon: 80.64,
            est_cost: null,
          },
        ],
      },
    ]);
  });

  it('drops an item that has no coordinates instead of passing nulls to the map', () => {
    const result = tripToItineraryDays(
      trip([day({ itinerary_item: [item({ latitude: null }), item({ id: 'item-2', longitude: null })] })]),
    );

    expect(result[0].items).toEqual([]);
  });

  it('returns [] for a trip with no saved days', () => {
    expect(tripToItineraryDays(trip([]))).toEqual([]);
  });

  it('parses a numeric est_cost string and leaves a null start_time unformatted', () => {
    const result = tripToItineraryDays(
      trip([day({ itinerary_item: [item({ start_time: null, est_cost: '1500.50' })] })]),
    );

    expect(result[0].items[0]).toMatchObject({ time: null, est_cost: 1500.5 });
  });
});

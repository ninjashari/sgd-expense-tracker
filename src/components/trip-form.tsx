"use client";

import { useActionState, useState } from "react";
import type { ActionResult } from "@/lib/action-helpers";
import type { Trip } from "@/lib/db/schema";
import { todayISO } from "@/lib/utils";
import {
  validateTripName,
  validateDestination,
  validateTripDates,
} from "@/lib/validations";

interface TripFormProps {
  action: (
    prev: ActionResult | null,
    formData: FormData
  ) => Promise<ActionResult>;
  trip?: Trip;
}

export function TripForm({ action, trip }: TripFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);
  const fieldErrors =
    state && !state.success ? state.fieldErrors : undefined;
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateField(name: string, value: string, extra?: string) {
    let err: string | null = null;
    if (name === "name") err = validateTripName(value);
    if (name === "destination") err = validateDestination(value);
    if (name === "dates") err = validateTripDates(value, extra || "");
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next[name] = err;
      else delete next[name];
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      {state && !state.success && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Trip Name
        </label>
        <input
          name="name"
          type="text"
          required
          maxLength={200}
          defaultValue={trip?.name}
          placeholder="e.g., Singapore Adventure"
          autoFocus
          onBlur={(e) => validateField("name", e.target.value)}
          className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300"
        />
        {(errors.name || fieldErrors?.name) && (
          <p className="text-xs text-red-500 mt-1">
            {errors.name || fieldErrors?.name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Destination
        </label>
        <input
          name="destination"
          type="text"
          required
          maxLength={100}
          defaultValue={trip?.destination}
          placeholder="e.g., Singapore"
          onBlur={(e) => validateField("destination", e.target.value)}
          className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300"
        />
        {(errors.destination || fieldErrors?.destination) && (
          <p className="text-xs text-red-500 mt-1">
            {errors.destination || fieldErrors?.destination}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Start Date
          </label>
          <input
            name="startDate"
            type="date"
            required
            defaultValue={trip?.startDate || todayISO()}
            className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            End Date
          </label>
          <input
            name="endDate"
            type="date"
            required
            defaultValue={trip?.endDate || todayISO()}
            className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>
      {(errors.dates || fieldErrors?.dates) && (
        <p className="text-xs text-red-500 -mt-4">
          {errors.dates || fieldErrors?.dates}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {isPending ? "Saving..." : trip ? "Update Trip" : "Create Trip"}
      </button>
    </form>
  );
}

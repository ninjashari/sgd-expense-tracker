"use client";

import type { Trip } from "@/lib/db/schema";
import { todayISO } from "@/lib/utils";

interface TripFormProps {
  action: (formData: FormData) => Promise<void>;
  trip?: Trip;
}

export function TripForm({ action, trip }: TripFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Trip Name
        </label>
        <input
          name="name"
          type="text"
          required
          defaultValue={trip?.name}
          placeholder="e.g. Singapore 2025"
          autoFocus
          className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Description (optional)
        </label>
        <textarea
          name="description"
          rows={2}
          defaultValue={trip?.description || ""}
          placeholder="What's this trip about?"
          className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Start Date
          </label>
          <input
            name="startDate"
            type="date"
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
            defaultValue={trip?.endDate || ""}
            className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors"
      >
        {trip ? "Update Trip" : "Create Trip"}
      </button>
    </form>
  );
}

import Link from "next/link";
import { ICON_MAP } from "@/lib/constants";
import { Ellipsis } from "lucide-react";
import type { CategoryRecord } from "@/lib/db/schema";

export function CategoryList({
  categories,
}: {
  categories: CategoryRecord[];
}) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-sm">No categories</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((cat) => {
        const Icon = ICON_MAP[cat.icon] || Ellipsis;
        return (
          <Link
            key={cat.id}
            href={`/categories/edit/${cat.id}`}
            className="block"
          >
            <div className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${cat.color}`}
              >
                <Icon size={16} />
              </div>
              <span className="text-sm font-medium">{cat.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

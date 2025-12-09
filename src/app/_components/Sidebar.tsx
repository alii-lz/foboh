import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Tag,
  Truck,
  Share2,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="pointer-events-none flex w-[20vw] flex-col bg-white">
      <nav className="flex-1 py-8">
        <ul className="space-y-1">
          <li>
            <Link
              href="/#"
              className="flex items-center gap-3 px-6 py-3 text-gray-600 transition-colors hover:bg-gray-50"
            >
              <LayoutDashboard size={20} />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/#"
              className="flex items-center gap-3 px-6 py-3 text-gray-600 transition-colors hover:bg-gray-50"
            >
              <ShoppingCart size={20} />
              <span className="text-sm font-medium">Orders</span>
            </Link>
          </li>
          <li>
            <Link
              href="/#"
              className="flex items-center gap-3 px-6 py-3 text-gray-600 transition-colors hover:bg-gray-50"
            >
              <Users size={20} />
              <span className="text-sm font-medium">Customers</span>
            </Link>
          </li>
          <li>
            <Link
              href="/#"
              className="flex items-center gap-3 px-6 py-3 text-gray-600 transition-colors hover:bg-gray-50"
            >
              <Package size={20} />
              <span className="text-sm font-medium">Products</span>
            </Link>
          </li>
          <li>
            <Link
              href="/#"
              className="flex items-center gap-3 border-r-2 border-emerald-600 bg-emerald-50 px-6 py-3 text-emerald-600 transition-colors"
            >
              <Tag size={20} />
              <span className="text-sm font-medium">Pricing</span>
            </Link>
          </li>
          <li>
            <Link
              href="/#"
              className="flex items-center gap-3 px-6 py-3 text-gray-600 transition-colors hover:bg-gray-50"
            >
              <Truck size={20} />
              <span className="text-sm font-medium">Freight</span>
              <span className="ml-auto text-xs font-semibold text-red-500">
                NEW
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/#"
              className="flex items-center gap-3 px-6 py-3 text-gray-600 transition-colors hover:bg-gray-50"
            >
              <Share2 size={20} />
              <span className="text-sm font-medium">Integrations</span>
            </Link>
          </li>
          <li>
            <Link
              href="/#"
              className="flex items-center gap-3 px-6 py-3 text-gray-600 transition-colors hover:bg-gray-50"
            >
              <Settings size={20} />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="border-t border-gray-200 p-6">
        <Image
          src="/FOBOH.png"
          alt="FOBOH Logo"
          className="h-auto w-32"
          width={128}
          height={64}
        />
      </div>
    </aside>
  );
}

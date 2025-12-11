import { PlusCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const today = new Date();

  // const { data: session } = useSession();

  // const user = session?.user;

  // const firstName = user?.name ? user.name.split(" ")[0] : "User";
  // const lastName = user?.name ? (user.name.split(" ")[1] ?? "") : "";

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // const handleLogout = () => {
  //   void signOut({ callbackUrl: "/" });
  // };

  return (
    <nav className="bg-teal-600 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="text-white">
          <h2 className="text-lg font-semibold">Hello, Ali</h2>
          <p className="text-sm text-teal-100">{formattedDate}</p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/ProductCreator">
            <button className="flex cursor-pointer items-center gap-2 rounded-full bg-[#4CAF50] px-5 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105 hover:bg-[#388E3C] focus:ring-2 focus:ring-[#4CAF50] focus:ring-offset-2">
              <PlusCircle size={18} className="text-white" />
              Navigate to Product Manager [Seed products]
            </button>
          </Link>

          <div className="text-right text-white">
            <p className="text-sm font-semibold">Ali Ahmed</p>
          </div>

          <div className="h-10 w-10 overflow-hidden rounded-sm bg-white">
            <div className="grid h-full w-full grid-cols-2 grid-rows-2">
              <div className="bg-black"></div>
              <div className="bg-white"></div>
              <div className="bg-white"></div>
              <div className="bg-black"></div>
            </div>
          </div>

          {/* <button
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105 hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <LogOut size={18} />
            Logout
          </button> */}
        </div>
      </div>
    </nav>
  );
}

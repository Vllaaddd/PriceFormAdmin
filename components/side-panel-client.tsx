'use client'

import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { Title } from "./title";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "@/lib/actions/auth-actions";
import Image from "next/image";

type Props = {
  session: any;
  isAdmin: boolean;
};

export const SidePanelClient: FC<Props> = ({ session, isAdmin }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const user = session?.user;

  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [isOpen]);

  const showAdminMenu = user && isAdmin;

  return (
    <>
      <div className={`lg:hidden top-4 right-4 z-50 ${isOpen ? 'hidden' : 'fixed'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#121212] text-white p-2 rounded-md shadow-md"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="hidden lg:flex w-72 bg-[#121212] text-white h-full p-6 shadow-lg flex-col items-center border-r border-gray-800">
        <h1 className="pb-8 text-2xl font-semibold text-center tracking-wide text-gray-100">
          Admin Dashboard
        </h1>

        <div className="flex flex-col gap-3 w-full overflow-y-auto flex-1 min-h-0 custom-scrollbar pr-2">
          {showAdminMenu ? (
            <>
              <Link href="/"><Title active={pathname === '/'} title="Home" /></Link>
              <Link href="/lines"><Title active={pathname === '/lines'} title="Lines" /></Link>
              <Link href="/materials"><Title active={pathname === '/materials'} title="Materials" /></Link>
              <Link href="/cores"><Title active={pathname === '/cores'} title="Cores" /></Link>
              <Link href="/skillets"><Title active={pathname === '/skillets'} title="Skillets" /></Link>
              <Link href="/umkartons" onClick={() => setIsOpen(false)}><Title active={pathname === '/umkartons'} title="Umkartons" /></Link>
              <Link href="/deckels" onClick={() => setIsOpen(false)}><Title active={pathname === '/deckels'} title="Deckels" /></Link>
              <Link href="/calculations"><Title active={pathname === '/calculations'} title="Calculations" /></Link>
              <Link href="/email-recipients"><Title active={pathname === '/email-recipients'} title="Email recipients" /></Link>
              <Link href="/admins"><Title active={pathname === '/admins'} title="Admins" /></Link>
              <Link href="/update-prices"><Title active={pathname === '/update-prices'} title="Update prices" /></Link>

              {user && (
                <div className="flex flex-col items-center gap-3 mt-10">
                  <div className="relative w-20 h-20">
                    <Image
                      src={user.image || "/default-avatar.png"}
                      alt={user.name || "User"}
                      fill
                      className="object-cover rounded-full border-2 border-blue-500 shadow-md"
                    />
                  </div>
                  <p className="text-lg font-medium text-gray-200">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              )}

              <button onClick={handleSignOut} className="mt-6">
                <Title active={false} title="Sign Out" />
              </button>
            </>
          ) : (
            <Link href="/login">
              <Title active={pathname === '/login'} title="Login" />
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#121212] text-white p-6 z-40 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="w-[28px]" />
              <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white transition"
              >
                <X size={28} />
              </button>
            </div>

            <div className="flex flex-col text-lg overflow-y-auto px-6 py-6 space-y-4 pr-8 -mr-8">
              {showAdminMenu ? (
                <>
                  <Link href="/" onClick={() => setIsOpen(false)}><Title active={pathname === '/'} title="Home" /></Link>
                  <Link href="/lines" onClick={() => setIsOpen(false)}><Title active={pathname === '/lines'} title="Lines" /></Link>
                  <Link href="/materials" onClick={() => setIsOpen(false)}><Title active={pathname === '/materials'} title="Materials" /></Link>
                  <Link href="/cores" onClick={() => setIsOpen(false)}><Title active={pathname === '/cores'} title="Cores" /></Link>
                  <Link href="/skillets" onClick={() => setIsOpen(false)}><Title active={pathname === '/skillets'} title="Skillets" /></Link>
                  <Link href="/umkartons" onClick={() => setIsOpen(false)}><Title active={pathname === '/umkartons'} title="Umkartons" /></Link>
                  <Link href="/deckels" onClick={() => setIsOpen(false)}><Title active={pathname === '/deckels'} title="Deckels" /></Link>
                  <Link href="/calculations" onClick={() => setIsOpen(false)}><Title active={pathname === '/calculations'} title="Calculations" /></Link>
                  <Link href="/email-recipients" onClick={() => setIsOpen(false)}><Title active={pathname === '/email-recipients'} title="Email recipients" /></Link>
                  <Link href="/admins" onClick={() => setIsOpen(false)}><Title active={pathname === '/admins'} title="Admins" /></Link>
                  <Link href="/update-prices" onClick={() => setIsOpen(false)}><Title active={pathname === '/update-prices'} title="Update prices" /></Link>

                  <div className="flex flex-col items-center gap-3 mt-10">
                    <div className="relative w-16 h-16">
                      <Image
                        src={user.image || "/default-avatar.png"}
                        alt={user.name || "User"}
                        fill
                        className="object-cover rounded-full border border-blue-500 shadow-sm"
                      />
                    </div>
                    <p className="text-base font-medium text-gray-200">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>

                  <button onClick={handleSignOut} className="mt-6 text-left">
                    <Title active={false} title="Sign Out" />
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Title active={pathname === '/login'} title="Login" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
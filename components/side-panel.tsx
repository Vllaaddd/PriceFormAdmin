'use client'

import Link from "next/link";
import { FC, useState } from "react";
import { Title } from "./title";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const SidePanel: FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={`lg:hidden top-4 right-4 z-50 ${isOpen? 'hidden' : 'fixed'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#121212] text-white p-2 rounded-md shadow-md"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="hidden lg:flex w-72 bg-[#121212] text-white min-h-screen p-6 shadow-lg flex-col items-center border-r border-gray-800">
        <h1 className="pb-10 text-2xl font-semibold text-center tracking-wide text-gray-100">
          Admin Dashboard
        </h1>

        <div className="flex flex-col gap-3 w-full">
          <Link href="/">
            <Title active={pathname === '/'} title="Home" />
          </Link>
          <Link href="/lines">
            <Title active={pathname === '/lines'} title="Lines" />
          </Link>
          <Link href="/materials">
            <Title active={pathname === '/materials'} title="Materials" />
          </Link>
          <Link href="/skillets">
            <Title active={pathname === '/skillets'} title="Skillets" />
          </Link>
          <Link href="/cores">
            <Title active={pathname === '/cores'} title="Cores" />
          </Link>
          <Link href="/calculations">
            <Title active={pathname === '/calculations'} title="Calculations" />
          </Link>
          <Link href="/email-recipients">
            <Title active={pathname === '/email-recipients'} title="Email recipients" />
          </Link>
          <Link href="/update-prices">
            <Title active={pathname === '/update-prices'} title="Update prices" />
          </Link>
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
            <div className="flex justify-between items-center mb-10">
                <div className="w-[28px]"></div>
                <h1 className="text-2xl font-semibold px-10">Admin Dashboard</h1>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-300 hover:text-white transition"
                >
                    <X size={28} />
                </button>
            </div>

            <div className="flex flex-col gap-4 text-lg">
              <Link href="/" onClick={() => setIsOpen(false)}>
                <Title active={pathname === '/'} title="Home" />
              </Link>
              <Link href="/lines" onClick={() => setIsOpen(false)}>
                <Title active={pathname === '/lines'} title="Lines" />
              </Link>
              <Link href="/materials" onClick={() => setIsOpen(false)}>
                <Title active={pathname === '/materials'} title="Materials" />
              </Link>
              <Link href="/skillets" onClick={() => setIsOpen(false)}>
                <Title active={pathname === '/skillets'} title="Skillets" />
              </Link>
              <Link href="/cores" onClick={() => setIsOpen(false)}>
                <Title active={pathname === '/cores'} title="Cores" />
              </Link>
              <Link href="/calculations" onClick={() => setIsOpen(false)}>
                <Title active={pathname === '/calculations'} title="Calculations" />
              </Link>
              <Link href="/email-recipients">
                <Title active={pathname === '/email-recipients'} title="Email recipients" />
              </Link>
              <Link href="/update-prices" onClick={() => setIsOpen(false)}>
                <Title active={pathname === '/update-prices'} title="Update prices" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

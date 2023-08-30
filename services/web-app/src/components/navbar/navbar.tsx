import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import HeaderButton from "../buttons/headerBtn";
import { SignInButton } from "../buttons/signIn";
import { SignOutButton } from "../buttons/signOut";
import Link from "next/link";

const navigation = [{ name: "Installation", href: "installation" }];

export default function NavBar() {
  const { data: session } = useSession();

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <a href="/">
                    <img
                      className="rounded-full overflow-hidden w-12 h-12"
                      src="/icon.png"
                      alt="Orion Reviews"
                    />
                  </a>
                  <Link className="text-xl font-bold ml-4" href="/">
                    Orion Review
                  </Link>
                </div>
                {navigation.map((item) => (
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <a
                      href={item.href}
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                    >
                      {item.name}
                    </a>
                  </div>
                ))}
              </div>

              <div className="flex items-center">
                {session ? (
                  <div className="flex items-center">
                    <HeaderButton text="Profile" route="/profile" />
                    <div className="flex flex-col">
                      <SignOutButton />
                    </div>
                  </div>
                ) : (
                  <SignInButton />
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-4 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  as="a"
                  href={item.href}
                  className="block border-l-4 border-indigo-500 bg-indigo-50 py-2 pl-3 pr-4 text-base font-medium text-indigo-700"
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

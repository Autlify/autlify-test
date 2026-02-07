'use client'

import {
  Agency,
  AgencySidebarOption,
  SubAccount,
  SubAccountSidebarOption,
} from '@/generated/prisma/client'
import React, { useEffect, useMemo, useState } from 'react'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '../ui/sheet'
import { Button } from '../ui/button'
import { ChevronDown, ChevronsUpDown, Compass, Menu, PlusCircleIcon } from 'lucide-react'
import clsx from 'clsx'
import { AspectRatio } from '../ui/aspect-ratio'
import Image from 'next/image'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import {
  IconArrowLeft,
  IconBrandTabler,
  IconCreditCard,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import { useModal } from '@/providers/modal-provider'
import CustomModal from '../global/custom-modal'
import SubAccountDetails from '../forms/subaccount-details'
import { Separator } from '../ui/separator'
import { icons } from '@/lib/constants'
import { Sidebar, SidebarProvider, useSidebar, SidebarBody, SidebarLink } from "@/components/ui/animated-sidebar";
import { FaExpandArrowsAlt, FaEye } from 'react-icons/fa'

type Props = {
  defaultOpen?: boolean
  subAccounts: SubAccount[]
  sidebarOpt: AgencySidebarOption[] | SubAccountSidebarOption[]
  sidebarLogo: string
  details: any
  user: any
  id: string
}

// const MenuOptions = ({
//   details,
//   id,
//   sidebarLogo,
//   sidebarOpt,
//   subAccounts,
//   user,
//   defaultOpen,
// }: Props) => {
//   const { setOpen: setModalOpen } = useModal()
//   const [open, setOpen] = useState(false);
//   const [isMounted, setIsMounted] = useState(false)

//   const openState = useMemo(
//     () => (defaultOpen ? { open: true } : {}),
//     [defaultOpen]
//   )

//   useEffect(() => {
//     setIsMounted(true)
//   }, [])

//   if (!isMounted) return

//   return (
//     <Sheet
//       open={open}
//       onOpenChange={setOpen}
//       modal={false}
//       {...openState}
//     >
//       <SheetTrigger
//         asChild
//         className="absolute left-4 top-4 z-[100] md:!hidden felx"
//       >
//         <Button
//           variant="outline"
//           size={'icon'}
//         >
//           <Menu />
//         </Button>
//       </SheetTrigger>

//       <SheetContent
//         showX={!defaultOpen}
//         side={'left'}
//         className={clsx(
//           'bg-background/80 backdrop-blur-xl fixed top-0 border-r-[1px] p-6',
//           {
//             'hidden md:inline-block z-0 w-[300px]': defaultOpen,
//             'inline-block md:hidden z-[100] w-full': !defaultOpen,
//           }
//         )}
//       >
//         <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
//         <SheetDescription className="sr-only">
//           Navigate between agency and subaccounts
//         </SheetDescription>
//         <div>
//           <AspectRatio ratio={16 / 5}>
//             <Image
//               src={sidebarLogo}
//               alt="Sidebar Logo"
//               fill
//               className="rounded-md object-contain"
//             />
//           </AspectRatio>
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button
//                 className="w-full my-4 flex items-center justify-between py-8"
//                 variant="ghost"
//               >
//                 <div className="flex items-center text-left gap-2">
//                   <Compass />
//                   <div className="flex flex-col">
//                     {details.name}
//                     <span className="text-muted-foreground">
//                       {details.address}
//                     </span>
//                   </div>
//                 </div>
//                 <div>
//                   <ChevronsUpDown
//                     size={16}
//                     className="text-muted-foreground"
//                   />
//                 </div>
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-80 h-80 mt-4 z-[200]">
//               <Command className="rounded-lg">
//                 <CommandInput placeholder="Search Accounts..." />
//                 <CommandList className="pb-16">
//                   <CommandEmpty> No results found</CommandEmpty>
//                   {user?.AgencyMemberships?.some(
//                     (m: any) => m.isActive && (m.Role?.name === 'AGENCY_OWNER' || m.Role?.name === 'AGENCY_ADMIN')
//                   ) && user?.AgencyMemberships?.[0]?.Agency && (
//                       <CommandGroup heading="Agency">
//                         <CommandItem className="!bg-transparent my-2 text-primary broder-[1px] border p-2 rounded-md hover:!bg-muted cursor-pointer transition-all">
//                           {defaultOpen ? (
//                             <Link
//                               href={`/agency/${user?.AgencyMemberships?.[0]?.Agency?.id}`}
//                               className="flex gap-4 w-full h-full"
//                             >
//                               <div className="relative w-16">
//                                 <Image
//                                   src={user?.AgencyMemberships?.[0]?.Agency?.agencyLogo || '/assets/glassmorphism/organization.svg'}
//                                   alt="Agency Logo"
//                                   fill
//                                   className="rounded-md object-contain"
//                                 />
//                               </div>
//                               <div className="flex flex-col flex-1">
//                                 {user?.AgencyMemberships?.[0]?.Agency?.name}
//                                 <span className="text-muted-foreground">
//                                   {user?.AgencyMemberships?.[0]?.Agency?.city}, {user?.AgencyMemberships?.[0]?.Agency?.country}
//                                 </span>
//                               </div>
//                             </Link>
//                           ) : (
//                             <SheetClose asChild>
//                               <Link
//                                 href={`/agency/${user?.AgencyMemberships?.[0]?.Agency?.id}`}
//                                 className="flex gap-4 w-full h-full"
//                               >
//                                 <div className="relative w-16">
//                                   <Image
//                                     src={user?.AgencyMemberships?.[0]?.Agency?.agencyLogo}
//                                     alt="Agency Logo"
//                                     fill
//                                     className="rounded-md object-contain"
//                                   />
//                                 </div>
//                                 <div className="flex flex-col flex-1">
//                                   {user?.AgencyMemberships?.[0]?.Agency?.name}
//                                   <span className="text-muted-foreground">
//                                     {user?.AgencyMemberships?.[0]?.Agency?.city}, {user?.AgencyMemberships?.[0]?.Agency?.country}
//                                   </span>
//                                 </div>
//                               </Link>
//                             </SheetClose>
//                           )}
//                         </CommandItem>
//                       </CommandGroup>
//                     )}
//                   <CommandGroup heading="Accounts">
//                     {!!subAccounts
//                       ? subAccounts.map((subaccount) => (
//                         <CommandItem key={subaccount.id}>
//                           {defaultOpen ? (
//                             <Link
//                               href={`/subaccount/${subaccount.id}`}
//                               className="flex gap-4 w-full h-full"
//                             >
//                               <div className="relative w-16">
//                                 <Image
//                                   src={subaccount.subAccountLogo}
//                                   alt="subaccount Logo"
//                                   fill
//                                   className="rounded-md object-contain"
//                                 />
//                               </div>
//                               <div className="flex flex-col flex-1">
//                                 {subaccount.name}
//                                 <span className="text-muted-foreground">
//                                   {subaccount.line1}
//                                 </span>
//                               </div>
//                             </Link>
//                           ) : (
//                             <SheetClose asChild>
//                               <Link
//                                 href={`/subaccount/${subaccount.id}`}
//                                 className="flex gap-4 w-full h-full"
//                               >
//                                 <div className="relative w-16">
//                                   <Image
//                                     src={subaccount.subAccountLogo}
//                                     alt="subaccount Logo"
//                                     fill
//                                     className="rounded-md object-contain"
//                                   />
//                                 </div>
//                                 <div className="flex flex-col flex-1">
//                                   {subaccount.name}
//                                   <span className="text-muted-foreground">
//                                     {subaccount.line1}
//                                   </span>
//                                 </div>
//                               </Link>
//                             </SheetClose>
//                           )}
//                         </CommandItem>
//                       ))
//                       : 'No Accounts'}
//                   </CommandGroup>
//                 </CommandList>
//                 {user?.AgencyMemberships?.some(
//                   (m: any) => m.isActive && (m.Role?.name === 'AGENCY_OWNER' || m.Role?.name === 'AGENCY_ADMIN')
//                 ) && (
//                     <SheetClose asChild>
//                       <Button
//                         className="w-full flex gap-2"
//                         onClick={() => {
//                           setModalOpen(
//                             <CustomModal
//                               title="Create A Subaccount"
//                               subheading="You can switch between your agency account and the subaccount from the sidebar"
//                             >
//                               <SubAccountDetails
//                                 agencyDetails={user?.AgencyMemberships?.[0]?.Agency as Agency}
//                                 userId={user?.id as string}
//                                 userName={user?.name}
//                               />
//                             </CustomModal>
//                           )
//                         }}
//                       >
//                         <PlusCircleIcon size={15} />
//                         Create Sub Account
//                       </Button>
//                     </SheetClose>
//                   )}
//               </Command>
//             </PopoverContent>
//           </Popover>
//           <p className="text-muted-foreground text-xs mb-2">MENU LINKS</p>
//           <Separator className="mb-4" />
//           <nav className="relative">
//             <Command className="rounded-lg overflow-visible bg-transparent">
//               <CommandInput placeholder="Search..." />
//               <CommandList className="py-4 overflow-visible">
//                 <CommandEmpty>No Results Found</CommandEmpty>
//                 <CommandGroup className="overflow-visible">
//                   {sidebarOpt.map((sidebarOptions) => {
//                     let val
//                     const result = icons.find(
//                       (icon) => icon.value === sidebarOptions.icon
//                     )
//                     if (result) {
//                       val = <result.path />
//                     }
//                     return (
//                       <CommandItem
//                         key={sidebarOptions.id}
//                         className="md:w-[320px] w-full"
//                       >
//                         <Link
//                           href={sidebarOptions.link}
//                           className="flex items-center gap-2 hover:bg-transparent rounded-md transition-all md:w-full w-[320px]"
//                         >
//                           {val}
//                           <span>{sidebarOptions.name}</span>
//                         </Link>
//                       </CommandItem>
//                     )
//                   })}
//                 </CommandGroup>
//               </CommandList>
//             </Command>
//           </nav>
//         </div>
//       </SheetContent>
//     </Sheet>
//   )
// }

// export default MenuOptions


const MenuOptions = ({
  defaultOpen,
  subAccounts,
  sidebarLogo,
  details,
  user,
  id,
  animated = true,
}: {
  defaultOpen?: boolean
  subAccounts: SubAccount[]
  sidebarLogo: string
  details: any
  user: any
  id: string
  animated?: boolean
}) => {
  const links = [
    {
      label: "Dashboard",
      href: `/${id}`,
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Launchpad",
      href: `/${id}/launchpad`,
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Billing",
      href: `/${id}/billing`,
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      subs: [
        { label: "Overview", href: `/${id}/billing` },
        { label: "Subscription", href: `/${id}/billing/subscription` },
        { label: "Payment Methods", href: `/${id}/billing/payment-methods` },
        { label: "Invoices", href: `/${id}/billing/invoices` },
        { label: "Credits", href: `/${id}/billing/credits` },
        { label: "Usage", href: `/${id}/billing/usage` },
        { label: "Coupons", href: `/${id}/billing/coupons` },
        { label: "Dunning", href: `/${id}/billing/dunning` },
        { label: "Allocation", href: `/${id}/billing/allocation` },
      ]
    },
    {
      label: "SubAccounts",
      href: `/${id}/all-subaccounts`,
      icon: (
        <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Team",
      href: `/${id}/team`,
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      subs: [
        { label: "Members", href: `/${id}/team` },
        { label: "Roles", href: `/${id}/team/roles` }
      ]
    },
    {
      label: "Apps",
      href: `/${id}/apps`,
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: 'Finance',
      href: `/${id}/fi/`,
      icon: (
        <IconCreditCard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      subs: [
        { label: "General Ledger", href: `/${id}/fi/general-ledger` },
      ]
    },
    {
      label: "Settings",
      href: `/${id}/settings`,
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    }
  ];
  const { setOpen: setModalOpen } = useModal()
  const [isMounted, setIsMounted] = useState(false)
  const [open, setOpen] = useState(defaultOpen || false)

  const [isShow, setIsShow] = useState({
    label: '',
    status: false
  })
  const [state, setState] = useState({
    label: '',
    status: false
  })

  const defaultOpenState = useMemo(
    () => (defaultOpen ? { open: true } : {}),
    [defaultOpen]
  )

  useMemo(() => {
    setState({
      label: isShow.label,
      status: isShow.status
    })
  }, [isShow])


  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (

    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {open ? (
            <div className="relative mb-8 mt-2 flex items-center justify-center">
              <a
                href="#"
                className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
              >
                <AspectRatio ratio={16 / 5}>
                  <Image
                    src={'/assets/naropo-logo.svg'}
                    alt="Naropo Logo"
                    fill
                    className="rounded-md object-contain"
                  />
                </AspectRatio>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium whitespace-pre text-black dark:text-white"
                >
                  Naropo
                </motion.span>
              </a>
              {!animated && <FaExpandArrowsAlt className="absolute right-3 top-3 text-black dark:text-white cursor-pointer" onClick={() => setOpen(false)} />}
            </div>
          ) : (
            <div className="relative mb-8 mt-2 flex items-center justify-center">
              <a
                href="#"
                className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
              >
                <AspectRatio ratio={16 / 5}>
                  <Image
                    src={'/assets/naropo-logo.svg'}
                    alt="Naropo Logo"
                    fill
                    className="rounded-md object-contain"
                  />
                </AspectRatio>
              </a>
              {!animated && <FaEye className="absolute right-3 top-3 text-black dark:text-white cursor-pointer" onClick={() => setOpen(true)} />}
            </div>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className={cn(open ? "w-full my-4 flex items-center justify-between py-8" : "w-12 h-12 my-4 flex items-center justify-center p-0")}
                variant="ghost"
              >
                <div className="flex items-center text-left gap-2">
                  <Compass />
                  <div className="flex flex-col">
                    {details.name}
                    <span className="text-muted-foreground">
                      {details.address}
                    </span>
                  </div>
                </div>
                {open && (
                  <ChevronsUpDown
                    size={16}
                    className="text-muted-foreground"
                  />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 h-80 mt-4 z-[200]">
              <Command className="rounded-lg">
                <CommandInput placeholder="Search Accounts..." />
                <CommandList className="pb-16">
                  <CommandEmpty> No results found</CommandEmpty>
                  {user?.AgencyMemberships?.some(
                    (m: any) => m.isActive && (m.Role?.name === 'AGENCY_OWNER' || m.Role?.name === 'AGENCY_ADMIN')
                  ) && user?.AgencyMemberships?.[0]?.Agency && (
                      <CommandGroup heading="Agency">
                        <CommandItem className="!bg-transparent my-2 text-primary broder-[1px] border p-2 rounded-md hover:!bg-muted cursor-pointer transition-all">
                          {defaultOpen ? (
                            <Link
                              href={`/agency/${user?.AgencyMemberships?.[0]?.Agency?.id}`}
                              className="flex gap-4 w-full h-full"
                            >
                              <div className="relative w-16">
                                <Image
                                  src={user?.AgencyMemberships?.[0]?.Agency?.agencyLogo || '/assets/glassmorphism/organization.svg'}
                                  alt="Agency Logo"
                                  fill
                                  className="rounded-md object-contain"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                {user?.AgencyMemberships?.[0]?.Agency?.name}
                                <span className="text-muted-foreground">
                                  {user?.AgencyMemberships?.[0]?.Agency?.city}, {user?.AgencyMemberships?.[0]?.Agency?.country}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <SheetClose asChild>
                              <Link
                                href={`/agency/${user?.AgencyMemberships?.[0]?.Agency?.id}`}
                                className="flex gap-4 w-full h-full"
                              >
                                <div className="relative w-16">
                                  <Image
                                    src={user?.AgencyMemberships?.[0]?.Agency?.agencyLogo}
                                    alt="Agency Logo"
                                    fill
                                    className="rounded-md object-contain"
                                  />
                                </div>
                                <div className="flex flex-col flex-1">
                                  {user?.AgencyMemberships?.[0]?.Agency?.name}
                                  <span className="text-muted-foreground">
                                    {user?.AgencyMemberships?.[0]?.Agency?.city}, {user?.AgencyMemberships?.[0]?.Agency?.country}
                                  </span>
                                </div>
                              </Link>
                            </SheetClose>
                          )}
                        </CommandItem>
                      </CommandGroup>
                    )}
                  <CommandGroup heading="Accounts">
                    {!!subAccounts
                      ? subAccounts.map((subaccount) => (
                        <CommandItem key={subaccount.id}>
                          {defaultOpen ? (
                            <Link
                              href={`/subaccount/${subaccount.id}`}
                              className="flex gap-4 w-full h-full"
                            >
                              <div className="relative w-16">
                                <Image
                                  src={subaccount.subAccountLogo}
                                  alt="subaccount Logo"
                                  fill
                                  className="rounded-md object-contain"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                {subaccount.name}
                                <span className="text-muted-foreground">
                                  {subaccount.line1}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <SheetClose asChild>
                              <Link
                                href={`/subaccount/${subaccount.id}`}
                                className="flex gap-4 w-full h-full"
                              >
                                <div className="relative w-16">
                                  <Image
                                    src={subaccount.subAccountLogo}
                                    alt="subaccount Logo"
                                    fill
                                    className="rounded-md object-contain"
                                  />
                                </div>
                                <div className="flex flex-col flex-1">
                                  {subaccount.name}
                                  <span className="text-muted-foreground">
                                    {subaccount.line1}
                                  </span>
                                </div>
                              </Link>
                            </SheetClose>
                          )}
                        </CommandItem>
                      ))
                      : 'No Accounts'}
                  </CommandGroup>
                </CommandList>
                {user?.AgencyMemberships?.some(
                  (m: any) => m.isActive && (m.Role?.name === 'AGENCY_OWNER' || m.Role?.name === 'AGENCY_ADMIN')
                ) && (
                    <SheetClose asChild>
                      <Button
                        className="w-full flex gap-2"
                        onClick={() => {
                          setModalOpen(
                            <CustomModal
                              title="Create A Subaccount"
                              subheading="You can switch between your agency account and the subaccount from the sidebar"
                            >
                              <SubAccountDetails
                                agencyDetails={user?.AgencyMemberships?.[0]?.Agency as Agency}
                                userId={user?.id as string}
                                userName={user?.name}
                              />
                            </CustomModal>
                          )
                        }}
                      >
                        <PlusCircleIcon size={15} />
                        Create Sub Account
                      </Button>
                    </SheetClose>
                  )}
              </Command>
            </PopoverContent>
          </Popover>

          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <div className="relative items-center justify-between" key={idx}>
                <Button
                  variant="ghost"
                  className={cn(
                    open ? "w-full flex items-center justify-between py-4" : "w-12 h-12 flex items-center justify-center p-0",
                    "hover:bg-transparent rounded-md transition-all md:w-full w-[320px]"
                  )}
                  onClick={() => {
                    if (state.label === link.label) {
                      setIsShow({
                        label: '',
                        status: !state.status
                      })
                    } else {
                      setIsShow({
                        label: link.label,
                        status: true
                      })
                    }
                  }}
                >
                  <SidebarLink key={idx} link={link} />
                  {state.label === link.label && link.subs && open && (
                    <ChevronDown
                      size={16}
                      className={cn(
                        "transition-transform",
                        {
                          "rotate-180": state.status,
                        }
                      )}
                    />
                  )}
                  {link.subs && open && (
                    <div className="ml-6 mt-2 flex flex-col gap-1">
                      {link.subs.map((sublink, subIdx) => (
                        <SidebarLink
                          key={subIdx}
                          link={{
                            label: sublink.label,
                            href: sublink.href,
                            icon: null,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div>
          {/* <SidebarLink
              link={{
                label: "Manu Arora",
                href: "#",
                icon: (
                  <img
                    src="https://assets.aceternity.com/manu.png"
                    className="h-7 w-7 shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            /> */}
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

// Dummy dashboard component with content
// const Dashboard = () => {
//   return (
//     <div className="flex flex-1">
//       <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
//         <div className="flex gap-2">
//           {[...new Array(4)].map((i, idx) => (
//             <div
//               key={"first-array-demo-1" + idx}
//               className="h-20 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
//             ></div>
//           ))}
//         </div>
//         <div className="flex flex-1 gap-2">
//           {[...new Array(2)].map((i, idx) => (
//             <div
//               key={"second-array-demo-1" + idx}
//               className="h-full w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
//             ></div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

export default MenuOptions
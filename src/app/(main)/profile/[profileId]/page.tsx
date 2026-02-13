
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { ProfileClient } from "./_components/profile-client"

// Types for profile data
export interface ProfileData {
  user: {
    id: string
    name: string
    firstName: string | null
    lastName: string | null
    email: string
    emailVerified: Date | null
    avatarUrl: string | null
    createdAt: Date
    updatedAt: Date
    customerId: string | null
    trialEligible: boolean
  }
  memberships: {
    id: string
    role: string
    isPrimary: boolean
    isActive: boolean
    agency: {
      id: string
      name: string
      agencyLogo: string
    }
    createdAt: Date
  }[]
  mfaMethods: {
    id: string
    type: string
    isEnabled: boolean
    createdAt: Date
  }[]
  sessions: {
    id: string
    expires: Date
    createdAt: Date
  }[]
  activityLog: {
    id: string
    action: string
    timestamp: Date
    metadata: Record<string, unknown> | null
  }[]
  stats: {
    totalAgencies: number
    totalSessions: number
    accountAge: number
    mfaEnabled: boolean
  }
}

interface Props {
  params: Promise<{ profileId: string }>
}

const Page = async ({ params }: Props) => {
  const { profileId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/sign-in")
  }

  // Only allow viewing own profile
  if (session.user.id !== profileId) {
    redirect(`/profile/${session.user.id}`)
  }

  // Single comprehensive fetch for all profile data
  const [user, memberships, mfaMethods, sessions] = await Promise.all([
    db.user.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        emailVerified: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        customerId: true,
        trialEligible: true,
      },
    }),
    db.agencyMembership.findMany({
      where: { userId: profileId, isActive: true },
      include: {
        Agency: {
          select: {
            id: true,
            name: true,
            agencyLogo: true,
          },
        },
        Role: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.mFAMethod.findMany({
      where: { userId: profileId },
      select: {
        id: true,
        type: true,
        isEnabled: true,
        createdAt: true,
      },
    }),
    db.session.findMany({
      where: { userId: profileId },
      select: {
        id: true,
        expires: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  if (!user) {
    redirect("/sign-in")
  }

  // Calculate stats
  const accountAge = Math.floor(
    (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  const profileData: ProfileData = {
    user,
    memberships: memberships.map((m) => ({
      id: m.id,
      role: m.Role.name,
      isPrimary: m.isPrimary,
      isActive: m.isActive,
      agency: {
        id: m.Agency.id,
        name: m.Agency.name,
        agencyLogo: m.Agency.agencyLogo,
      },
      createdAt: m.createdAt,
    })),
    mfaMethods,
    sessions,
    activityLog: [],
    stats: {
      totalAgencies: memberships.length,
      totalSessions: sessions.length,
      accountAge,
      mfaEnabled: mfaMethods.some((m) => m.isEnabled),
    },
  }

  return <ProfileClient data={profileData} />
}

export default Page
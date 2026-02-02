import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FaCheckCircle, FaFile, FaUserShield, FaLink } from 'react-icons/fa'
import type { User, Subscription, TermsAgreement } from '@/generated/prisma/client'
import { PricingPlan } from '@autlify/billing-sdk'
import { LinkIcon, ShieldCheck } from 'lucide-react'

interface AgreementStatusProps {
    user: User & { termsAgreement: TermsAgreement | null }
    subscription?: PricingPlan
}

export function AgreementStatus({ user, subscription }: AgreementStatusProps) {
    const formatDate = (timestamp?: number) => {
        if (!timestamp) return 'Not agreed'
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-medium mb-1">Agreement Status</h3>
                <p className="text-sm text-muted-foreground">
                    Review your accepted terms and agreements
                </p>
            </div>

            <Separator />

            <div className="space-y-4">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FaFile className="w-5 h-5 text-primary" />
                                <CardTitle className="text-base">Terms & Conditions</CardTitle>
                            </div>
                            {user.termsAgreement?.agreedToTermsConditions && (
                                <Badge variant="outline" className="gap-1">
                                    <FaCheckCircle className="w-3 h-3" />
                                    Accepted
                                </Badge>
                            )}
                        </div>
                        <CardDescription className="text-xs">
                            {formatDate(user.termsAgreement?.termsConditionsAgreedAt?.getTime())}
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FaUserShield className="w-5 h-5 text-primary" />
                                <CardTitle className="text-base">Privacy Policy</CardTitle>
                            </div>
                            {user.termsAgreement?.agreedToPrivacy && (
                                <Badge variant="outline" className="gap-1">
                                    <FaCheckCircle className="w-3 h-3" />
                                    Accepted
                                </Badge>
                            )}
                        </div>
                        <CardDescription className="text-xs">
                            {formatDate(user.termsAgreement?.privacyAgreedAt?.getTime())}
                        </CardDescription>
                    </CardHeader>
                </Card>

                {user.termsAgreement?.agreedToServiceTerms && (
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="w-5 h-5 text-primary" />
                                    <CardTitle className="text-base">Service Terms ({user.termsAgreement?.serviceTermsAgreedAt?.toLocaleDateString()})</CardTitle>
                                </div>
                                <Badge variant="outline" className="gap-1">
                                    <FaCheckCircle className="w-3 h-3" />
                                    Accepted
                                </Badge>
                            </div>
                            <CardDescription className="text-xs">
                                {formatDate(user.termsAgreement?.serviceTermsAgreedAt?.getTime())}
                            </CardDescription>
                        </CardHeader>
                        {user.termsAgreement?.agreedToThirdPartyServices && user.termsAgreement?.thirdPartyServicesAgreedAt && (
                            <CardContent className="pt-0">
                                <div className="text-xs text-muted-foreground">
                                    <p className="mb-2">Third-party services in use:</p>
                                    <div className="flex flex-wrap gap-1">

                                        <Badge key={user!.id} variant="secondary" className="text-xs" />

                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                )}
            </div>
        </div>
    )
}
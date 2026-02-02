import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendPasswordResetEmail, sendVerificationEmail } from '@/lib/email'
import { createVerificationToken } from '@/lib/queries'
import type { EmailTokenScope, TokenRequest } from '@/types/auth'

/**
 * @method POST /api/auth/token
 * @namespace AuthToken
 * @description Create a verification token for various authentication purposes
 * @module IAM
 * @param req 
 * @returns 
 */
export async function POST(req: Request) {
    try {
        const { email, scope } = await req.json() as TokenRequest

        if (!email || !scope) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }
        
        const existingUser = await db.user.findUnique({
            where: { email },
        })

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User does not exist' },
                { status: 400 }
            )
        }

        // Create verification token (24 hours expiry)
        const verificationToken = await createVerificationToken(
            email,
            scope,
            24 * 60 * 60 * 1000
        )

        const cooldown = (parseInt(process.env.AUTH_COOLDOWN_MINUTES!)) * 60 * 1000
        const whereClause = existingUser.name
            ? { email, token: verificationToken.token, name: existingUser.name }
            : { email, token: verificationToken.token, name: `${existingUser.firstName} ${existingUser.lastName}` }

        switch (scope) {
            case 'verify':
                // Send verification email
                await sendVerificationEmail(whereClause)
                break
            case 'reset-request':
                // Send password reset email
                await sendPasswordResetEmail(whereClause)
                break
            default:
                return NextResponse.json(
                    { error: 'Invalid scope' },
                    { status: 400 }
                )
        }

        return NextResponse.json(
            {
                message: 'Verification token created and email sent successfully.',
                userId: existingUser.id,
                cooldownSeconds: Math.ceil(cooldown / 1000),
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Token creation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}




//     const { firstName, lastName, name, email, password } = await req.json()

//     if (!firstName || !lastName || !name || !email || !password) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       )
//     }

//     // Check if user already exists
//     const existingUser = await db.user.findUnique({
//       where: { email },
//     })

//     if (existingUser) {
//       return NextResponse.json(
//         { error: 'User already exists' },
//         { status: 400 }
//       )
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10) 

//     // Create user
//     const user = await db.user.create({
//       data: {
//         firstName,
//         lastName,
//         name,
//         email,
//         password: hashedPassword,
//       },
//     })

//     // Create verification token (24 hours expiry)
//     const verificationToken = await createVerificationToken(
//       email,
//       'verify',
//       24 * 60 * 60 * 1000
//     )

//     const cooldown = (parseInt(process.env.AUTH_COOLDOWN_MINUTES!)) * 60 * 1000

//     // Send verification email
//     await sendVerificationEmail({ email, token: verificationToken.token, name })

//     return NextResponse.json(
//       { 
//         message: 'User created successfully. Please check your email to verify your account.', 
//         userId: user.id,
//         cooldownSeconds: Math.ceil(cooldown / 1000),
//       },
//       { status: 201 }
//     )
//   } catch (error) {
//     console.error('Registration error:', error)
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }

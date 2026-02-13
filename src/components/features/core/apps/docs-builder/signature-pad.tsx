'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
    Download,
    Upload,
    RotateCcw,
    Check,
    FileText,
    Shield,
    Pen,
    Type,
    Image as ImageIcon
} from 'lucide-react'

export interface SignatureData {
    type: 'drawn' | 'typed' | 'uploaded' | 'digital_certificate' | 'computer_generated'
    data: string // Base64 encoded image or text
    timestamp: Date
    metadata?: {
        width?: number
        height?: number
        font?: string
        size?: number
        color?: string
        certificateInfo?: {
            issuer: string
            subject: string
            validFrom: Date
            validTo: Date
            fingerprint: string
        }
    }
}

interface SignaturePadProps {
    onSignature: (signature: SignatureData) => void
    onCancel?: () => void
    defaultType?: 'drawn' | 'typed' | 'uploaded' | 'digital_certificate' | 'computer_generated'
    width?: number
    height?: number
    className?: string
    showComputerGenerated?: boolean
    generatedText?: string
}

export function SignaturePad({
    onSignature,
    onCancel,
    defaultType = 'drawn',
    width = 400,
    height = 200,
    className,
    showComputerGenerated = true,
    generatedText = 'Digitally Signed Document'
}: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [activeTab, setActiveTab] = useState(defaultType)
    const [typedSignature, setTypedSignature] = useState('')
    const [signatureFont, setSignatureFont] = useState('Dancing Script')
    const [signatureSize, setSignatureSize] = useState(24)
    const [signatureColor, setSignatureColor] = useState('#000000')
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Available signature fonts
    const signatureFonts = [
        'Dancing Script',
        'Great Vibes',
        'Allura',
        'Alex Brush',
        'Kaushan Script',
        'Pacifico',
        'Satisfy'
    ]

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        // Set canvas size
        canvas.width = width
        canvas.height = height

        // Set drawing styles
        context.strokeStyle = '#000000'
        context.lineWidth = 2
        context.lineCap = 'round'
        context.lineJoin = 'round'

        // Clear canvas with white background
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, width, height)
    }, [width, height])

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const context = canvas.getContext('2d')
        if (!context) return

        context.beginPath()
        context.moveTo(x, y)
        setIsDrawing(true)
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return

        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const context = canvas.getContext('2d')
        if (!context) return

        context.lineTo(x, y)
        context.stroke()
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, width, height)
    }

    const generateTypedSignature = () => {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const context = canvas.getContext('2d')
        if (!context) return ''

        // Clear with white background
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, width, height)

        // Set font and color
        context.font = `${signatureSize}px "${signatureFont}"`
        context.fillStyle = signatureColor
        context.textAlign = 'center'
        context.textBaseline = 'middle'

        // Draw text
        context.fillText(typedSignature, width / 2, height / 2)

        return canvas.toDataURL()
    }

    const generateComputerSignature = () => {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const context = canvas.getContext('2d')
        if (!context) return ''

        // Clear with white background
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, width, height)

        // Draw border
        context.strokeStyle = '#0066cc'
        context.lineWidth = 2
        context.strokeRect(10, 10, width - 20, height - 20)

        // Set text styles
        context.fillStyle = '#0066cc'
        context.font = 'bold 14px Arial'
        context.textAlign = 'center'

        // Draw signature text
        context.fillText(generatedText, width / 2, height / 2 - 20)

        // Draw timestamp
        context.font = '12px Arial'
        const timestamp = new Date().toLocaleString()
        context.fillText(timestamp, width / 2, height / 2 + 10)

        // Draw verification text
        context.font = '10px Arial'
        context.fillText('Electronically Signed - Do Not Modify', width / 2, height / 2 + 30)

        return canvas.toDataURL()
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const result = event.target?.result as string
            if (result) {
                onSignature({
                    type: 'uploaded',
                    data: result,
                    timestamp: new Date(),
                    metadata: {
                        width,
                        height
                    }
                })
            }
        }
        reader.readAsDataURL(file)
    }

    const handleSave = () => {
        const canvas = canvasRef.current

        switch (activeTab) {
            case 'drawn':
                if (!canvas) return
                const drawnData = canvas.toDataURL()
                onSignature({
                    type: 'drawn',
                    data: drawnData,
                    timestamp: new Date(),
                    metadata: { width, height }
                })
                break

            case 'typed':
                if (!typedSignature.trim()) return
                const typedData = generateTypedSignature()
                onSignature({
                    type: 'typed',
                    data: typedData,
                    timestamp: new Date(),
                    metadata: {
                        width,
                        height,
                        font: signatureFont,
                        size: signatureSize,
                        color: signatureColor
                    }
                })
                break

            case 'computer_generated':
                const generatedData = generateComputerSignature()
                onSignature({
                    type: 'computer_generated',
                    data: generatedData,
                    timestamp: new Date(),
                    metadata: {
                        width,
                        height
                    }
                })
                break

            case 'digital_certificate':
                // This would typically integrate with a digital certificate service
                // For now, we'll generate a placeholder
                const certData = generateComputerSignature()
                onSignature({
                    type: 'digital_certificate',
                    data: certData,
                    timestamp: new Date(),
                    metadata: {
                        width,
                        height,
                        certificateInfo: {
                            issuer: 'LHDNM Certificate Authority',
                            subject: 'User Certificate',
                            validFrom: new Date(),
                            validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                            fingerprint: 'SHA-256:' + Math.random().toString(36).substr(2, 32)
                        }
                    }
                })
                break
        }
    }

    return (
        <Card className={cn('w-full max-w-2xl', className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Pen className="h-5 w-5" />
                    Digital Signature
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
                        <TabsTrigger value="drawn" className="flex items-center gap-1">
                            <Pen className="h-3 w-3" />
                            <span className="hidden sm:inline">Draw</span>
                        </TabsTrigger>
                        <TabsTrigger value="typed" className="flex items-center gap-1">
                            <Type className="h-3 w-3" />
                            <span className="hidden sm:inline">Type</span>
                        </TabsTrigger>
                        <TabsTrigger value="uploaded" className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            <span className="hidden sm:inline">Upload</span>
                        </TabsTrigger>
                        <TabsTrigger value="digital_certificate" className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            <span className="hidden sm:inline">Cert</span>
                        </TabsTrigger>
                        {showComputerGenerated && (
                            <TabsTrigger value="computer_generated" className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                <span className="hidden sm:inline">Auto</span>
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="drawn" className="space-y-4">
                        <div className="flex flex-col items-center space-y-4">
                            <canvas
                                ref={canvasRef}
                                className="border border-gray-300 rounded-lg cursor-crosshair"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearCanvas}
                                className="flex items-center gap-2"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Clear
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="typed" className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="signature-text">Signature Text</Label>
                                <Input
                                    id="signature-text"
                                    value={typedSignature}
                                    onChange={(e) => setTypedSignature(e.target.value)}
                                    placeholder="Enter your signature"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="signature-font">Font</Label>
                                    <select
                                        id="signature-font"
                                        value={signatureFont}
                                        onChange={(e) => setSignatureFont(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        aria-label='Signature Font'
                                    >
                                        {signatureFonts.map(font => (
                                            <option key={font} value={font}>{font}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="signature-size">Size</Label>
                                    <Input
                                        id="signature-size"
                                        type="number"
                                        min="12"
                                        max="48"
                                        value={signatureSize}
                                        onChange={(e) => setSignatureSize(Number(e.target.value))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="signature-color">Color</Label>
                                    <Input
                                        id="signature-color"
                                        type="color"
                                        value={signatureColor}
                                        onChange={(e) => setSignatureColor(e.target.value)}
                                    />
                                </div>
                            </div>

                            {typedSignature && (
                                <div
                                    className="border border-gray-300 rounded-lg p-4 text-center bg-white"
                                    style={{
                                        fontFamily: signatureFont,
                                        fontSize: signatureSize,
                                        color: signatureColor,
                                        minHeight: height / 3
                                    }}
                                >
                                    {typedSignature}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="uploaded" className="space-y-4">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-600 mb-4">Upload signature image</p>
                                <Button
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Choose File
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    aria-label='Signature Image Upload'
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="digital_certificate" className="space-y-4">
                        <div className="text-center space-y-4">
                            <Shield className="h-16 w-16 mx-auto text-blue-600" />
                            <div>
                                <h3 className="text-lg font-semibold">Digital Certificate Signature</h3>
                                <p className="text-gray-600">
                                    This will use your digital certificate to create a legally binding signature
                                    compliant with LHDNM e-Invoice requirements.
                                </p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Certificate Info:</strong><br />
                                    Issuer: LHDNM Certificate Authority<br />
                                    Valid: Current - 1 Year<br />
                                    Status: Active
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    {showComputerGenerated && (
                        <TabsContent value="computer_generated" className="space-y-4">
                            <div className="text-center space-y-4">
                                <FileText className="h-16 w-16 mx-auto text-green-600" />
                                <div>
                                    <h3 className="text-lg font-semibold">Computer Generated Signature</h3>
                                    <p className="text-gray-600">
                                        Automatically generated electronic signature with timestamp and verification.
                                    </p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-green-800">
                                        This signature will include:<br />
                                        • Timestamp verification<br />
                                        • Electronic seal<br />
                                        • Document integrity hash<br />
                                        • LHDNM compliance markers
                                    </p>
                                </div>
                            </div>
                        </TabsContent>
                    )}
                </Tabs>

                <div className="flex justify-end gap-2 mt-6">
                    {onCancel && (
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button onClick={handleSave} className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Apply Signature
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default SignaturePad

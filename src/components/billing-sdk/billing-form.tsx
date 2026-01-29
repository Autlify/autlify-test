"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CountrySelector,
  StateSelector,
  CitySelector,
  PostalCodeInput,
  PhoneCodeSelector,
} from "@/components/global/location";
import { Country, State, City } from "country-state-city";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const billingFormSchema = z.object({
  // Account Details
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  phoneCode: z.string().optional(),

  // Billing Address
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  countryCode: z.string().optional(),
  stateCode: z.string().optional(),
});

export type BillingFormData = z.infer<typeof billingFormSchema>;

export interface BillingFormProps {
  defaultValues?: Partial<BillingFormData>;
  onSubmit: (data: BillingFormData) => void | Promise<void>;
  isLoading?: boolean;
  className?: string;
  showAccountSection?: boolean;
  showBillingSection?: boolean;
  submitButtonText?: string;
  readOnlyEmail?: boolean;
}

export function BillingForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  className,
  showAccountSection = true,
  showBillingSection = true,
  submitButtonText = "Save Billing Information",
  readOnlyEmail = false,
}: BillingFormProps) {
  const [countryCode, setCountryCode] = useState<string>(defaultValues?.countryCode || "");
  const [stateCode, setStateCode] = useState<string>(defaultValues?.stateCode || "");
  const [city, setCity] = useState<string>(defaultValues?.city || "");
  const [phoneCode, setPhoneCode] = useState<string>(defaultValues?.phoneCode || "");
  const [phoneNumber, setPhoneNumber] = useState<string>(defaultValues?.phone || "");

  const form = useForm<BillingFormData>({
    resolver: zodResolver(billingFormSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      phoneCode: "",
      companyName: "",
      taxId: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      countryCode: "",
      stateCode: "",
      ...defaultValues,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <div className={cn("w-full", className)}>
      <Card className="shadow-lg">
        <CardHeader className="px-4 pb-4 sm:px-6 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Billing Information</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Manage your billing details and address
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Section */}
            {showAccountSection && (
              <>
                <div className="border-l-4 border-primary pl-5">
                  <h2 className="text-2xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-1 tracking-tight">
                    Account
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Your contact information
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label className="mb-2 block">Full Name *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="text"
                        {...form.register("firstName")}
                        placeholder="First"
                        className="h-10"
                        disabled={isLoading}
                      />
                      <Input
                        type="text"
                        {...form.register("lastName")}
                        placeholder="Last"
                        className="h-10"
                        disabled={isLoading}
                      />
                    </div>
                    {(form.formState.errors.firstName || form.formState.errors.lastName) && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.firstName?.message ||
                          form.formState.errors.lastName?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="mb-2 block">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="john@example.com"
                      className="h-10"
                      disabled={isLoading || readOnlyEmail}
                      readOnly={readOnlyEmail}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="mb-2 block">
                    Phone Number *
                  </Label>
                  <PhoneCodeSelector
                    value={phoneNumber}
                    onValueChange={(value, phoneCodeData) => {
                      setPhoneNumber(value);
                      setPhoneCode(phoneCodeData || "");
                      form.setValue("phone", value);
                      form.setValue("phoneCode", phoneCodeData || "");
                    }}
                    countryCode={countryCode}
                    onCountryCodeChange={(code, countryData) => {
                      setCountryCode(code);
                      form.setValue("phoneCode", countryData?.phonecode || "");
                      form.setValue("country", countryData?.name || "", {
                        shouldValidate: true,
                      });
                      form.setValue("countryCode", code);
                    }}
                    placeholder="Enter phone number"
                    disabled={isLoading}
                    styleVariant="plain"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <Separator className="my-6" />
              </>
            )}

            {/* Billing Section */}
            {showBillingSection && (
              <>
                <div className="border-l-4 border-primary pl-5">
                  <h2 className="text-2xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-1 tracking-tight">
                    Billing
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Billing address and tax information
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="companyName" className="mb-2 block">
                        Company Name{" "}
                        <span className="text-xs text-muted-foreground ml-1 font-normal">
                          (Optional)
                        </span>
                      </Label>
                      <Input
                        id="companyName"
                        {...form.register("companyName")}
                        placeholder="My Company Ltd."
                        className="h-10"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="taxId" className="mb-2 block">
                        Tax ID{" "}
                        <span className="text-xs text-muted-foreground ml-1 font-normal">
                          (Optional)
                        </span>
                      </Label>
                      <Input
                        id="taxId"
                        {...form.register("taxId")}
                        placeholder="123-45-6789"
                        className="h-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <Label className="mb-2 block">Address *</Label>
                    <div className="grid md:grid-cols-4 gap-2">
                      <Input
                        {...form.register("addressLine2")}
                        placeholder="Apt/Suite (Optional)"
                        className="h-10"
                        disabled={isLoading}
                      />
                      <Input
                        className="md:col-span-2 h-10"
                        {...form.register("addressLine1")}
                        placeholder="Street Address"
                        disabled={isLoading}
                      />
                      <PostalCodeInput
                        value={form.watch("postalCode")}
                        onValueChange={(value: string) =>
                          form.setValue("postalCode", value)
                        }
                        placeholder="Postal Code"
                        countryCode={countryCode}
                        styleVariant="plain"
                        disabled={isLoading}
                      />
                    </div>
                    {(form.formState.errors.addressLine1 ||
                      form.formState.errors.postalCode) && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.addressLine1?.message ||
                          form.formState.errors.postalCode?.message}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="grid md:grid-cols-3 gap-5">
                    <div>
                      <Label htmlFor="country" className="mb-2 block">
                        Country *
                      </Label>
                      <CountrySelector
                        value={countryCode}
                        onValueChange={(code, countryData) => {
                          setCountryCode(code);
                          setStateCode("");
                          setCity("");
                          form.setValue("country", countryData?.name || "");
                          form.setValue("countryCode", code);
                          form.setValue("state", "");
                          form.setValue("stateCode", "");
                          form.setValue("city", "");
                        }}
                        placeholder="Select country"
                        disabled={isLoading}
                        styleVariant="plain"
                      />
                      {form.formState.errors.country && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.country.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="state" className="mb-2 block">
                        State / Province *
                      </Label>
                      <StateSelector
                        countryCode={countryCode}
                        value={stateCode}
                        onValueChange={(code, stateData) => {
                          setStateCode(code);
                          setCity("");
                          form.setValue("state", stateData?.name || "");
                          form.setValue("stateCode", code);
                          form.setValue("city", "");
                        }}
                        placeholder="Select state"
                        disabled={isLoading || !countryCode}
                        styleVariant="plain"
                      />
                      {form.formState.errors.state && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.state.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="city" className="mb-2 block">
                        City *
                      </Label>
                      <CitySelector
                        countryCode={countryCode}
                        stateCode={stateCode}
                        value={city}
                        onValueChange={(cityName: string, cityData: any) => {
                          setCity(cityData.name);
                          form.setValue("city", cityData.name);
                        }}
                        placeholder="Select city"
                        disabled={isLoading || !stateCode}
                        styleVariant="plain"
                      />
                      {form.formState.errors.city && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.city.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
                className="shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitButtonText}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

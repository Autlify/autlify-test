import "@ncdai/react-wheel-picker/style.css";

import * as WheelPickerPrimitive from "@ncdai/react-wheel-picker";

import { cn } from "@/lib/utils";

type WheelPickerValue = WheelPickerPrimitive.WheelPickerValue;

type WheelPickerOption<T extends WheelPickerValue = string> =
  WheelPickerPrimitive.WheelPickerOption<T>;

type WheelPickerClassNames = WheelPickerPrimitive.WheelPickerClassNames;

function WheelPickerWrapper({
  className,
  ...props
}: React.ComponentProps<typeof WheelPickerPrimitive.WheelPickerWrapper>) {
  return (
    <WheelPickerPrimitive.WheelPickerWrapper
      className={cn(
        "w-56 rounded-lg border border-line-primary bg-bg-primary px-1 shadow-xs",
        "*:data-rwp:first:*:data-rwp-highlight-wrapper:rounded-s-md",
        "*:data-rwp:last:*:data-rwp-highlight-wrapper:rounded-e-md",
        className
      )}
      {...props}
    />
  );
}

function WheelPicker<T extends WheelPickerValue = string>({
  classNames,
  ...props
}: WheelPickerPrimitive.WheelPickerProps<T>) {
  return (
    <WheelPickerPrimitive.WheelPicker
      classNames={{
        optionItem: "text-muted-foreground",
        highlightWrapper: cn(
          "bg-bg-tertiary text-fg-primary",
          "data-rwp-focused:ring-2 data-rwp-focused:ring-line-tertiary data-rwp-focused:ring-inset"
        ),
        ...classNames,
      }}
      {...props}
    />
  );
}

export { WheelPicker, WheelPickerWrapper };
export type { WheelPickerClassNames, WheelPickerOption };




// ==================================== Demo ========================================
//  Sample No.1: Usage of the WheelPicker component with hour, minute, and meridiem options
// ==================================================================================
const createArray = (length: number, add = 0): WheelPickerOption<number>[] =>
  Array.from({ length }, (_, i) => {
    const value = i + add;
    return {
      label: value.toString().padStart(2, "0"),
      value: value,
    };
  });

const hourOptions = createArray(12, 1);
const minuteOptions = createArray(60);
const meridiemOptions: WheelPickerOption[] = [
  { label: "AM", value: "AM" },
  { label: "PM", value: "PM" },
];

export function WheelPickerDemo() {
  return (
    <div className="w-56">
      <WheelPickerWrapper>
        <WheelPicker options={hourOptions} defaultValue={9} infinite />
        <WheelPicker options={minuteOptions} defaultValue={41} infinite />
        <WheelPicker options={meridiemOptions} defaultValue="AM" />
      </WheelPickerWrapper>
    </div>
  );
}


'use client'

import React from 'react'
import LiquidGlassBase  from 'liquid-glass-react'

type Props = React.ComponentProps<typeof LiquidGlassBase>;

const LiquidGlass = (props: Props) => {
  return (
    <LiquidGlassBase
    {...props}
      mouseContainer={props.mouseContainer}
    >
      {props.children}
    </LiquidGlassBase>
  );
}

LiquidGlass.displayName = 'LiquidGlass';

export default LiquidGlass;

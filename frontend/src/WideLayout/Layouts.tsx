// WideLayout/Layouts.tsx

import React, {forwardRef} from 'react';
import Container, {ContainerProps} from "./Container";


// FC (Flex Column)
const FC = forwardRef<HTMLDivElement, ContainerProps>(({
                                                           children,
                                                           sx = {},
                                                           ...props
                                                       }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{display: 'flex', flexDirection: 'column', ...sx}}
    >
        {children}
    </Container>
));
FC.displayName = 'FC';

// FR (Flex Row)
const FR = forwardRef<HTMLDivElement, ContainerProps>(({
                                                           children,
                                                           sx = {},
                                                           ...props
                                                       }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{display: 'flex', flexDirection: 'row', ...sx}}
    >
        {children}
    </Container>
));
FR.displayName = 'FR';

// FCC (Flex Column Center)
const FCC = forwardRef<HTMLDivElement, ContainerProps>(({
                                                            children,
                                                            sx = {},
                                                            ...props
                                                        }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', ...sx}}
    >
        {children}
    </Container>
));
FCC.displayName = 'FCC';

// FCS (Flex Column Start)
const FCS = forwardRef<HTMLDivElement, ContainerProps>(({
                                                            children,
                                                            sx = {},
                                                            ...props
                                                        }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', ...sx}}
    >
        {children}
    </Container>
));
FCS.displayName = 'FCS';

// FRS (Flex Row Start)
const FRS = forwardRef<HTMLDivElement, ContainerProps>(({
                                                            children,
                                                            sx = {},
                                                            ...props
                                                        }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', ...sx}}
    >
        {children}
    </Container>
));
FRS.displayName = 'FRS';

// FCE (Flex Column End)
const FCE = forwardRef<HTMLDivElement, ContainerProps>(({
                                                            children,
                                                            sx = {},
                                                            ...props
                                                        }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', ...sx}}
    >
        {children}
    </Container>
));
FCE.displayName = 'FCE';

// FRE (Flex Row End)
const FRE = forwardRef<HTMLDivElement, ContainerProps>(({
                                                            children,
                                                            sx = {},
                                                            ...props
                                                        }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', ...sx}}
    >
        {children}
    </Container>
));
FRE.displayName = 'FRE';

// FCB (Flex Column Between)
const FCB = forwardRef<HTMLDivElement, ContainerProps>(({
                                                            children,
                                                            sx = {},
                                                            ...props
                                                        }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', ...sx}}
    >
        {children}
    </Container>
));
FCB.displayName = 'FCB';

// FCA (Flex Column Around)
const FCA = forwardRef<HTMLDivElement, ContainerProps>(({
                                                            children,
                                                            sx = {},
                                                            ...props
                                                        }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around', ...sx}}
    >
        {children}
    </Container>
));
FCA.displayName = 'FCA';

// FRC (Flex Row Center)
const FRC = forwardRef<HTMLDivElement, ContainerProps>(({
                                                            children,
                                                            sx = {},
                                                            ...props
                                                        }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', ...sx}}
    >
        {children}
    </Container>
));
FRC.displayName = 'FRC';

// FRB (Flex Row Between)
const FRB = forwardRef<HTMLDivElement, ContainerProps>(({
                                                            children,
                                                            sx = {},
                                                            ...props
                                                        }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', ...sx}}
    >
        {children}
    </Container>
));
FRB.displayName = 'FRB';

// FRA (Flex Row Around)
const FRA = forwardRef<HTMLDivElement, ContainerProps>(({
                                                            children,
                                                            sx = {},
                                                            ...props
                                                        }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', ...sx}}
    >
        {children}
    </Container>
));
FRA.displayName = 'FRA';

// FCCC (Flex Column Center Center)
const FCCC = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            ...sx
        }}
    >
        {children}
    </Container>
));
FCCC.displayName = 'FCCC';

// FCCS (Flex Column Center Start)
const FCCS = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            ...sx
        }}
    >
        {children}
    </Container>
));
FCCS.displayName = 'FCCS';

// FRCS (Flex Row Center Start)
const FRCS = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-start',
            ...sx
        }}
    >
        {children}
    </Container>
));
FRCS.displayName = 'FRCS';

// FRCE (Flex Row Center End)
const FRCE = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-end',
            ...sx
        }}
    >
        {children}
    </Container>
));
FRCE.displayName = 'FRCE';

// FCCE (Flex Column Center End)
const FCCE = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-end',
            ...sx
        }}
    >
        {children}
    </Container>
));
FCCE.displayName = 'FCCE';

// FCBC (Flex Column Between Center)
const FCBC = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            ...sx
        }}
    >
        {children}
    </Container>
));
FCBC.displayName = 'FCBC';

// FCAC (Flex Column Around Center)
const FCAC = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'center',
            ...sx
        }}
    >
        {children}
    </Container>
));
FCAC.displayName = 'FCAC';

// FRCC (Flex Row Center Center)
const FRCC = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            ...sx
        }}
    >
        {children}
    </Container>
));
FRCC.displayName = 'FRCC';

// FRBC (Flex Row Between Center)
const FRBC = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            ...sx
        }}
    >
        {children}
    </Container>
));
FRBC.displayName = 'FRBC';

// FRBS (Flex Row Between Start)
const FRBS = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            ...sx
        }}
    >
        {children}
    </Container>
));
FRBS.displayName = 'FRBS';

// FRBE (Flex Row Between End)
const FRBE = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            ...sx
        }}
    >
        {children}
    </Container>
));
FRBE.displayName = 'FRBE';

// FRAC (Flex Row Around Center)
const FRAC = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            ...sx
        }}
    >
        {children}
    </Container>
));
FRAC.displayName = 'FRAC';

// FCSC (Flex Column Start Center)
const FCSC = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            ...sx
        }}
    >
        {children}
    </Container>
));
FCSC.displayName = 'FCSC';

// FRSC (Flex Row Start Center)
const FRSC = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            ...sx
        }}
    >
        {children}
    </Container>
));
FRSC.displayName = 'FRSC';

// FCSS (Flex Column Start Start)
const FCSS = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            ...sx
        }}
    >
        {children}
    </Container>
));
FCSS.displayName = 'FCSS';

// FRSS (Flex Row Start Start)
const FRSS = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            ...sx
        }}
    >
        {children}
    </Container>
));
FRSS.displayName = 'FRSS';

// FCSE (Flex Column Start End)
const FCSE = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
            ...sx
        }}
    >
        {children}
    </Container>
));
FCSE.displayName = 'FCSE';

// FRSE (Flex Row Start End)
const FRSE = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
            ...sx
        }}
    >
        {children}
    </Container>
));
FRSE.displayName = 'FRSE';

// FCEE (Flex Column End End)
const FCEE = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            ...sx
        }}
    >
        {children}
    </Container>
));
FCEE.displayName = 'FCEE';

// FCEC (Flex Column End Center)
const FCEC = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            ...sx
        }}
    >
        {children}
    </Container>
));
FCEC.displayName = 'FCEC';

// FREE (Flex Row End End)
const FREE = forwardRef<HTMLDivElement, ContainerProps>(({
                                                             children,
                                                             sx = {},
                                                             ...props
                                                         }, ref) => (
    <Container
        ref={ref}
        {...props}
        sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            ...sx
        }}
    >
        {children}
    </Container>
));
FREE.displayName = 'FREE';

export {
    Container,
    FR, FC, FCC, FCS, FRS, FCE, FRE, FCB, FCA, FRC, FRB, FRA,
    FCCC, FCCS, FRCS, FRCE, FCCE, FCBC, FCAC, FRCC, FRBC, FRBS,
    FRBE, FRAC, FCSC, FRSC, FCSS, FRSS, FCSE, FRSE, FCEE, FCEC,
    FREE,
};

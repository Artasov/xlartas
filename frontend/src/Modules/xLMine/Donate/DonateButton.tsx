// Modules/xLMine/Donate/DonateButton.tsx
import React, {useState} from "react";
import DonateModal from "./DonateModal";
import Button from "Core/components/elements/Button/Button";

const DonateButton: React.FC = () => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <Button classNameOverride={' '}
                    color={'#fff1'}
                    sx={{
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        backdropFilter: 'blur(5px) saturate(2) brightness(4) hue-rotate(30deg)',
                    }} onClick={handleOpen}>
                Поддержать
            </Button>
            {open && (
                <DonateModal
                    isOpen={open}
                    onClose={handleClose}
                />
            )}
        </>
    );
};

export default DonateButton;

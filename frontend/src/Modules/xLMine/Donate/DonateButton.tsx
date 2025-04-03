import React, {useState} from "react";
import DonateModal from "./DonateModal";
import Button from "Core/components/elements/Button/Button";

const DonateButton: React.FC = () => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <Button onClick={handleOpen}>
                Купить коины
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

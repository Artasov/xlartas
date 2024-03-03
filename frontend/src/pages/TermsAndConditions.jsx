import {Container, Typography} from "@mui/material";

const TermsAndConditions = () => (
    <Container maxWidth="sm" style={{marginTop: '20px'}}>
        <Typography variant="h4" component="h1" gutterBottom>
            Terms And Conditions Of Use
        </Typography>
        <Typography variant="h6">
            Intellectual Property Rights
        </Typography>
        <Typography paragraph>
            xlartas owns all the intellectual property rights and materials contained in this Website.
        </Typography>

        <Typography variant="h6">
            Copyright
        </Typography>
        <Typography paragraph>
            All content included on this site, such as text, graphics, logos, button icons, images, audio clips, digital
            downloads, data compilations, and software, is the property of xlartas. The compilation of all content on
            this site is the exclusive property of xlartas, with copyright authorship for this collection by xlartas,
            and protected by international copyright laws.
        </Typography>

        <Typography variant="h6">
            Your Membership Account
        </Typography>
        <Typography paragraph>
            If you use this product, you are responsible for maintaining the confidentiality of your account and
            password and for restricting access to your computer, and you agree to accept responsibility for all
            activities that occur under your account or password. If you are under 18, you may use our product only with
            involvement of a parent or guardian. xlartas and its associates reserve the right to refuse service,
            terminate accounts, remove or edit content, or cancel orders in their sole discretion.
        </Typography>

        <Typography variant="h6">
            Additional Terms and Conditions
        </Typography>
        <Typography paragraph>
            The absence of a video recording of the purchase means that you transferred the money in the form of a gift
            or donation. We do not bear any responsibility for providing you with services, products. We(xlartas) in
            turn, at our discretion, can help you.
        </Typography>
    </Container>
);

export default TermsAndConditions;
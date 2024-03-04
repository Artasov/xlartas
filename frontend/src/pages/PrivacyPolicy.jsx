import {Container, Typography} from "@mui/material";
import Head from "../components/base/Head";
import React from "react";

const PrivacyPolicy = () => (
    <Container maxWidth="sm" style={{marginTop: '20px'}}>
        <Head title={'xl | Privacy Policy'}/>
        <Typography variant="h4" component="h1" gutterBottom>
            Privacy Policy
        </Typography>
        <Typography variant="h6">
            How do we collect your personal details?
        </Typography>
        <Typography paragraph>
            When you sign up for our service, we store your account's email address and username. In the future, the
            nickname and the name of the guild, if you add them. We do not have access to the password or other details
            of your third-party account.
        </Typography>

        <Typography variant="h6">
            What other data do we collect from you?
        </Typography>
        <Typography paragraph>
            When you use xlartas's products, we may collect various usage data and errors to make future improvements to
            our service and solve your problems more efficiently.
        </Typography>

        <Typography variant="h6">
            Do we share your information with third parties?
        </Typography>
        <Typography paragraph>
            No, any data we collect from you, solely serves the purpose of potentially improving our service. We do not
            share or sell any information to third-parties.
        </Typography>

        <Typography variant="h6">
            For the participants of the referral program.
        </Typography>
        <ul>
            <li>Inviter - the one who invited the user via his personal link.</li>
            <li>Referral - the one who clicked on the link provided by the inviter.</li>
        </ul>
        <Typography paragraph>
            The inviter will be able to see the referral's nickname and its total number of program launches from the
            catalog(/shop).
        </Typography>
    </Container>
);

export default PrivacyPolicy;
import React from 'react';
import {Helmet} from "react-helmet";
import art from "../static/img/art-square-logo.png";

const Head = ({title}) => {
    return (<Helmet>
        <title>{title}</title>
        <link rel="icon" type="image/png" href={art} sizes="16x16"/>
    </Helmet>);
};

export default Head;

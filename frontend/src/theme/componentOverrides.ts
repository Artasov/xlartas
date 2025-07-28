// theme/componentOverrides.ts
import {ThemeOptions} from '@mui/material/styles';
import commonOverrides from './overrides/common';
import buttonOverrides from './overrides/button';
import dialogOverrides from './overrides/dialog';
import tabsOverrides from './overrides/tabs';
import accordionOverrides from './overrides/accordion';

const componentOverrides: ThemeOptions['components'] = Object.assign(
    {},
    commonOverrides,
    buttonOverrides,
    dialogOverrides,
    tabsOverrides,
    accordionOverrides,
);

export default componentOverrides;

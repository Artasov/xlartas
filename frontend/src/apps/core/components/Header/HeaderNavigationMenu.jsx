import {Link} from 'react-router-dom';
import {forwardRef} from "react";
import {useAuth} from "../auth/useAuth";
import {useStyles} from "../Theme/useStyles";

const HeaderNavigationMenu = forwardRef(({onHideMenu}, ref) => {
    const {user, isAuthenticated} = useAuth();
    const classes = useStyles();

    return (
        <nav className={`header-nav ${classes.boxShadowLO06}`} ref={ref}>
            <ul className="header-nav-list fs-5 frcc gap-3">
                <li>
                    <Link to="/software/" className={`text-decoration-none ${classes.textPrimary}`}
                          onClick={onHideMenu}>Software</Link>
                </li>
                <li>
                    <Link to="/surveys/" className={`text-decoration-none ${classes.textPrimary}`}
                          onClick={onHideMenu}>Surveys</Link>
                </li>
                <li>
                    <Link to="/about/" className={`text-decoration-none ${classes.textPrimary}`}
                          onClick={onHideMenu}>About</Link>
                </li>
                {isAuthenticated && <li>
                    {user.is_staff &&
                        <Link to="/admin/" target={'_blank'} className={`text-decoration-none  ${classes.textSecondary}`}
                              onClick={onHideMenu}>Admin</Link>
                    }
                </li>}
            </ul>
        </nav>
    );
});

export default HeaderNavigationMenu;

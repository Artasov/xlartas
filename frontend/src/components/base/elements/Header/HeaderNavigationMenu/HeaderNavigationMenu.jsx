import {Link} from 'react-router-dom';
import {forwardRef} from "react";
import {useAuth} from "../../../auth/useAuth";

const HeaderNavigationMenu = forwardRef(({onHideMenu}, ref) => {
    const {user, isAuthenticated, logout} = useAuth();

    return (
        <nav className="header-nav" ref={ref}>
            <ul className="header-nav-list fs-5 frcc gap-3">
                <li>
                    <Link to="/software/" className="text-decoration-none text-white-c0" onClick={onHideMenu}>Software</Link>
                </li>
                <li>
                    <Link to="/about/" className="text-decoration-none text-white-c0" onClick={onHideMenu}>About</Link>
                </li>
                {isAuthenticated && (
                    <li>
                        {user.is_staff && (
                            <Link to="/admin/" target={'_blank'} className="text-decoration-none text-white-c0"
                                  onClick={onHideMenu}>Admin</Link>)
                        }
                    </li>
                )}
            </ul>
        </nav>
    );
});

export default HeaderNavigationMenu;

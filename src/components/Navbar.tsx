/**
 * Navbar component that provides top-level navigation and brand identity.
 * Adapts based on the user's authentication state, showing links for login/signup or dashboard access.
 */
import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";
import { ModeToggle } from "./mode-toggle";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    if (user) {
      void fetchUnreadCount();

      const subscription = supabase
        .channel("notifications_count")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            void fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        void subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (!error) {
      setUnreadCount(count || 0);
    }
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await signOut();
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  function Logo() {
    return (
      <div className="flex items-center gap-2">
        {/* <div className="flex aspect-square bg-white size-16 ">
          <img src="/wishlist-logo-min.png" alt="" />
        </div> */}
        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
          <span className="navbar-logo truncate font-semibold">Mi List</span>
          <span className="truncate text-xs">Your wishlists</span>
        </div>
      </div>
    )
  }


  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link
          to={user ? "/dashboard" : "/"}
          // className="navbar-logo"
          onClick={closeMenu}
        >
          {/* Me List */}

          {Logo()}


        </Link>

        <div className="flex items-center gap-2">

          <div
            className={`navbar-toggle ${isMenuOpen ? "active" : ""}`}
            onClick={toggleMenu}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
                onClick={closeMenu}
              >
                My Wishlist
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
                onClick={closeMenu}
              >
                Home
              </NavLink>

              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
                onClick={closeMenu}
              >
                Login
              </NavLink>
              <Link
                to="/signup"
                className="navbar-btn signup"
                onClick={closeMenu}
              >
                Sign Up
              </Link>
            </>
          )}
          {/* code hidden until after beta launch
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? "navbar-link active" : "navbar-link"
            }
            onClick={closeMenu}
          >
            Contact
          </NavLink> */}

          {/* <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? "navbar-link active" : "navbar-link"
            }
            onClick={closeMenu}
          >
            Contact
          </NavLink> */}

          <NavLink
            to="/faq"
            className={({ isActive }) =>
              isActive ? "navbar-link active" : "navbar-link"
            }
            onClick={closeMenu}
          >
            FAQ
          </NavLink>

          {/* ============================================================
              DARK MODE TOGGLE - Currently Disabled
              To re-enable: Uncomment the line below AND follow 
              instructions in App.tsx to enable ThemeProvider
              ============================================================ */}
          {/* <ModeToggle /> */}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;

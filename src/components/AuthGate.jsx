import { useAuth0 } from "@auth0/auth0-react";
import Spinner from "./Spinner";

/**
 * Renders children only for a logged-in user. Because the AccountsProvider and
 * LandingPage live inside it, no API call is made before a token is available.
 */
const AuthGate = ({ children }) => {
  const { isLoading, isAuthenticated, error, user, loginWithRedirect, logout, getAccessTokenSilently,getIdTokenClaims } =
    useAuth0();

  if (isLoading) return <Spinner label="checking session.." />;

  if (error) return <p>Authentication error: {error.message}</p>;

  if (!isAuthenticated) {
    return (
      <>
        <h2 className="app-title">Banking Application Light</h2>
        <button onClick={() => loginWithRedirect()}>Log in</button>
      </>
    );
  }
  
  return (
    <>
      <div style={{ textAlign: "right", padding: "8px 16px" }}>
        <span>{user?.email ?? user?.name ?? user?.sub} </span>
        <button
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
        >
          Log out
        </button>
      </div>
      {children}
    </>
  );
};

export default AuthGate;
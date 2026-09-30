import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { Auth0Provider } from '@auth0/auth0-react'
import AuthGate from './components/AuthGate.jsx'

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE;

createRoot(document.getElementById('root')).render(
  <StrictMode>

     <Auth0Provider
      domain= {auth0Domain}
      clientId= {auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        // Same API identifier as AUTH0_AUDIENCE on the backend; makes Auth0 issue
        // a JWT access token that the gateway and services accept.
        audience: auth0Audience,
        scope: "openid profile email",
      }}
    >
      <AuthGate>
         <App />
      </AuthGate>
    </Auth0Provider>
   
  </StrictMode>,
)

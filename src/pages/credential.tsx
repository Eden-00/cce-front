import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { CredentialView } from 'src/sections/credential/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Result - ${CONFIG.appName}`}</title>
      </Helmet>

      <CredentialView />
    </>
  );
}

import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ActivateView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Activate - ${CONFIG.appName}`}</title>
      </Helmet>

      <ActivateView />
    </>
  );
}

import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { LicenseView } from 'src/sections/license/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`License - ${CONFIG.appName}`}</title>
      </Helmet>

      <LicenseView />
    </>
  );
}

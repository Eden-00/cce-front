import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ExecuteView } from 'src/sections/execute/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Execute - ${CONFIG.appName}`}</title>
      </Helmet>

      <ExecuteView />
    </>
  );
}

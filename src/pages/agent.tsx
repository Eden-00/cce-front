import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AgentView } from 'src/sections/agent/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Agent - ${CONFIG.appName}`}</title>
      </Helmet>

      <AgentView />
    </>
  );
}

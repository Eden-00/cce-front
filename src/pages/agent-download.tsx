import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AgentDownloadView } from 'src/sections/agent-download/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`AgentDownload - ${CONFIG.appName}`}</title>
      </Helmet>

      <AgentDownloadView />
    </>
  );
}

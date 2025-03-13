import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ResultView } from 'src/sections/result/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Result - ${CONFIG.appName}`}</title>
      </Helmet>

      <ResultView />
    </>
  );
}

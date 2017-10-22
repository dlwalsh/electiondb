import React from 'react';
import { mapProps } from 'recompose';

function Election({
  identifier,
  realm,
}) {
  return (
    <div>
      {realm} {identifier}
    </div>
  );
}

const enhance = mapProps(({ match }) => ({
  identifier: match.params.slug,
  realm: match.params.realm,
}));

export default enhance(Election);

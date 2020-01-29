import _ from 'lodash';

const formatGraphQLErrors = error => {
  const errorDetails = _.get(error, 'originalError.response.body');

  try {
    if (errorDetails) return errorDetails;
  } catch (e) {
    return e;
  }

  return error;
};

export default formatGraphQLErrors;

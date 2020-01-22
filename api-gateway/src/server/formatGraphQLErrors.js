import _ from 'lodash';

const formatGraphQLErrors = error => {
  const errorDetails = _.get(error, 'originalError.response.body');
  console.log('erroe', error);
  try {
    if (errorDetails) return JSON.parse(errorDetails);
  } catch (e) {
    return e;
  }
  return error;
};

export default formatGraphQLErrors;

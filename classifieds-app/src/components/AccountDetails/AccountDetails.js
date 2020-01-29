import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Login from './Login';
import SignUp from './SignUp';
import Account from './Account';

const AccountDetails = () => {
  const session = useSelector(state => state.session);
  const [isSigningUp, setIsSignUp] = useState(false);

  if (session) return <Account />;

  return isSigningUp ? <SignUp onChangeToLogin={() => setIsSignUp(false)} /> : <Login onChangeToSignUp={() => setIsSignUp(true)} />;
};

export default AccountDetails;
